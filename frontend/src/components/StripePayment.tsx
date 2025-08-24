// This should be in its own file, e.g., StripeForm.tsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './stripeCheckoutForm.tsx'; // Your checkout form component

// Replace with your actual publishable key
const stripePromise = loadStripe('pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3');

// This is where you would fetch your client secret from your backend
const fetchClientSecret = async () => {
  const response = await fetch('/create-payment-intent', { method: 'POST' });
  const { clientSecret } = await response.json();
  return clientSecret;
};

export default function StripeForm() {
  const options = {
    // You'll need to fetch the client secret from your backend.
    // This example fetches it once.
    clientSecret: 'YOUR_CLIENT_SECRET_FROM_BACKEND', // Replace with a call to fetch the secret
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}