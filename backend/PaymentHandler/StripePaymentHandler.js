import Stripe from 'stripe';
const stripe = new Stripe('sk_test_...');

const customer = await stripe.customers.create({
  email: 'customer@example.com',
});

console.log(customer.id);