import DodoPayments from "dodopayments";
import dotenv from "dotenv";
dotenv.config();
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
const DODO_PAYMENTS_API_KEY = process.env.dodo_test_key; //currently using test api key
// new dodo payment client
const client = new DodoPayments({
  bearerToken: DODO_PAYMENTS_API_KEY,
  environment: "test_mode",
});

// creating a new subscription
export async function CreateSubscirption(req, res) {
  try {
    // const user = req.user;
    // if (!user || !user?.user_id)
    //   return res.status(401).json({ message: "Please login to continue" });

    const user = {
      user_id: ":r90-k0fk0ewr",
      email: "xyz@gmail.com",
      username: "xyz",
    };
    const { amount, product_id, duration } = req.body;
    if (
      !amount ||
      typeof amount !== "number" ||
      amount <= 0 ||
      !product_id ||
      typeof product_id !== "string" ||
      !duration ||
      typeof duration !== "number"
    )
      return res.status(400).json({
        message:
          "Invalid amount or product ID provided or invalid duration type",
      });
    const checkoutSessionResponse = await client.checkoutSessions.create({
      product_cart: [{ product_id: product_id, quantity: 1 }],
      customer: { email: user.email, name: user.username },
      return_url: `${process.env.CLIENT_URL}/checkout/?message=success`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/?message=failure`,
    });
    console.log(checkoutSessionResponse);
    return res.status(200).json({
      message: "Subscription created",
      checkOutUrl: checkoutSessionResponse.checkout_url,
    });
  } catch (error) {
    // notifyMe(
    //   "This is a severe levele error in the payment handler which creats a new subscription\n",
    //   error
    // );
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong while creating a new subscription",
    });
  }
}
