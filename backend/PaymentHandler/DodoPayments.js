import DodoPayments from "dodopayments";
import dotenv from "dotenv";
dotenv.config();
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { redisClient } from "../CachingHandler/redisClient.js";
const DODO_PAYMENTS_API_KEY = process.env.dodo_test_key; //currently using test api key
// new dodo payment client
const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: "live_mode",
  webhookKey: process.env.DODO_WEBHOOK_SECRET,
});

// creating a new subscription
export async function CreateSubscription(req, res) {
  try {
    const user = req.user;
    if (!user?.user_id)
      return res.status(401).json({ message: "Unauthorized" });

    const plans = [
      { name: "sprint pass", amount: 1400 },
      { name: "Professional", amount: 7900 },
      { name: "Professional Annual", amount: 69900 },
      { name: "planners", amount: 3800 }, //in cents
    ];
    const { amount, product_id, duration } = req.body;
    if (
      !amount ||
      typeof amount !== "number" ||
      amount <= 0 ||
      !product_id ||
      !duration
    )
      return res.status(400).json({ message: "Invalid payload" });

    // Insert pending payment row
    const plan = plans.find((e) => e.amount === amount);
    if (!plan) return res.status(400).json({ message: "Invalid plan amount" });

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id, quantity: 1 }],
      customer: { email: user.email, name: user.username },
      return_url: `${process.env.CLIENT_URL}/checkout/?status=success`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/?status=cancelled`,
      metadata: { user_id: user.user_id, plan_duration: String(duration) },
    });

    const { error: PaymentsError } = await supabase
      .from("Payments")
      .update({
        order_id: session.session_id, //
        amount_paid: amount, //store in cents for easy storage
        plan_duration: duration,
        status: "pending",
        plan_type: plan.name,
        plan_status: "inactive", // not active until webhook confirms
        currency: "USD",
        receipt_id: null, // not known yet — set by webhook on success
      })
      .eq("user_id", user.user_id);
    if (PaymentsError) {
      console.error(PaymentsError);
      return res.status(400).json({
        message:
          "An error occurred while creating your subscription please try again later",
      });
    }
    return res.status(200).json({
      checkOutUrl: session.checkout_url,
      order_id: session.session_id,
    });
  } catch (error) {
    console.error(error, "error in the subscription creatin handler");
    notifyMe(
      "This is an error in the dodoPayments new subscription creation handler error\n",
      error
    );
    return res.status(500).json({ message: "Failed to create subscription" });
  }
}

// web hook handler

export async function DodoWebhook(req, res) {
  try {
    const event = client.webhooks.unwrap(req.body.toString(), {
      headers: {
        "webhook-id": req.headers["webhook-id"],
        "webhook-signature": req.headers["webhook-signature"],
        "webhook-timestamp": req.headers["webhook-timestamp"],
      },
    });

    res.json({ received: true });

    // Process events
    switch (event.type) {
      case "payment.succeeded":
        await handlePaymentSucceeded(event);
        break;
      case "payment.failed":
        await handlePaymentFailed(event);
        break;
      case "payment.cancelled":
        await handlePaymentCancel(event);
        break;
      case "payment.processing":
        await handlePendingPayment(event);
        break;
      case "refund.succeeded":
        await handleRefundSuccess(event);
      case "dispute.opened":
        notifyMe(
          `A new dispute request has been opened for following reason:${event.data.reason}`,
          "this is not an error"
        );
      default:
        break;
    }
  } catch (error) {
    notifyMe("An error occured in the dodoPayments webHook handler\n", error);

    console.error("Webhook error:", error);
    return res.status(401).json({ error: "Invalid signature" });
  }
}

// payment success handler
const handlePaymentSucceeded = async (event) => {
  const data = event.data;
  try {
    const startDate = new Date();

    const { data: existing } = await supabase
      .from("Payments")
      .select("plan_duration, user_id")
      .eq("order_id", data.checkout_session_id)
      .select()
      .single();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (existing?.plan_duration || 365)); // days not months

    const { data: updateed, error } = await supabase
      .from("Payments")
      .update({
        status: "paid",
        plan_status: "active",
        receipt_id: data.payment_id, // the receipt
        user_paid_amount: data.total_amount, // stays in cents
        user_paid_currency: data.currency, //currency that the user has paid in
        start_date: startDate.toISOString().split("T")[0],
        plan_expiry_date: expiryDate.toISOString().split("T")[0],
        invoice_url: data.invoice_url,
        error_message: data.error_message, //error may be null here
      })
      .eq("order_id", data.checkout_session_id);

    // also update the user status
    await supabase
      .from("user")
      .update({ IsPremiumUser: true })
      .eq("id", existing?.user_id);
    // delete the data from cache for refresh
    const cacheKey = `user:${existing.user_id}:dashboard`;
    redisClient.del(cacheKey);
  } catch (err) {
    notifyMe(
      "A payment has been made and this error has occured while updating the database\n",
      err
    );
    console.error("handlePaymentSucceeded error", err);
  }
};

const handlePaymentFailed = async (event) => {
  const data = event.data;
  try {
    await supabase
      .from("Payments")
      .update({
        status: "failed",
        plan_status: "active",
        plan_type: "free", // reset — payment did not go through
        order_id: null, // clear for next attempt
        receipt_id: null,
        amount_paid: null,
        currency: null,
        plan_duration: null,
        error_message: data?.error_message || null,
        invoice_url: data?.invoice_url || null,
      })
      .eq("order_id", data.checkout_session_id);
  } catch (err) {
    notifyMe("A payment has failed and this error occured\n", err);

    console.error("handlePaymentFailed error", err);
  }
};

const handlePaymentCancel = async (event) => {
  const data = event.data;
  try {
    await supabase
      .from("Payments")
      .update({
        status: "cancelled",
        plan_status: "active",
        plan_type: "free",
        order_id: null,
        receipt_id: null,
        amount_paid: null,
        currency: null,
        plan_duration: null,
        error_message: data?.error_message || null,
        invoice_url: data?.invoice_url || null,
      })
      .eq("order_id", data.checkout_session_id);
  } catch (err) {
    notifyMe("A payment has been canceled and this error has occured\n", err);
    console.error("handlePaymentCancel error", err);
  }
};

const handlePendingPayment = async (event) => {
  const data = event.data;
  try {
    await supabase
      .from("Payments")
      .update({
        status: "processing",
        plan_status: "inactive", // no access until succeeded fires
      })
      .eq("order_id", data.checkout_session_id);
  } catch (err) {
    notifyMe("A payment is pending and this error has occured\n", err);
    console.error("handlePendingPayment error", err);
  }
};

// to check the payment status
export async function GetPaymentStatus(req, res) {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Please login to continue" });
    const { order_id } = req.body;

    if (!order_id || typeof order_id !== "string")
      return res.status(400).json({ message: "Invalid or missing order_id" });
    const { data, error } = await supabase
      .from("Payments")
      .select("status, plan_status, plan_expiry_date, amount_paid, currency")
      .eq("order_id", order_id)
      .single();

    if (error || !data)
      return res.status(404).json({ message: "Payment not found" });

    return res.status(200).json({ data, status: data?.status });
  } catch (err) {
    notifyMe("An error occured while getting the payment status \n", err);
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// refunds success status handler
async function handleRefundSuccess(event) {
  const data = event.data;
  try {
    const { data: payment } = await supabase
      .from("Payments")
      .select("user_id")
      .eq("receipt_id", data.payment_id)
      .single();

    await supabase
      .from("Payments")
      .update({
        status: "refunded",
        plan_status: "active",
        plan_type: "free",
      })
      .eq("receipt_id", data.payment_id);

    if (payment?.user_id) {
      await supabase
        .from("users")
        .update({ IsPremiumUser: false })
        .eq("id", payment.user_id);
      redisClient.del(`user:${payment.user_id}:dashboard`);
    }
  } catch (err) {
    notifyMe("refund success webhook handler error", err);
    console.error(err, "refund success webhook handler error");
  }
}
