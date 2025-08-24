// This should be in its own file, e.g., CheckoutForm.tsx
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event:any) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment confirmation page
        return_url: `${window.location.origin}/confirmation`,
      },
    });

    if (error.type === 'card_error' || error.type === 'validation_error') {
      alert(error.message);
    } else {
      alert('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button 
        disabled={isLoading || !stripe || !elements} 
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-black text-white bai-jamjuree-medium transition-colors cursor-pointer"
      >
        <span>Pay now</span>
      </button>
    </form>
  );
};

export default CheckoutForm;