import { useState } from "react";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { createRazorpayOrder } from "../services/bookingService";

interface UseRazorpayProps{
    onSuccess:(paymentId:string)=>void
    onError:(error:string)=>void
}

interface UseRazorpayReturn{
    initiatePayment:(amount:number, name:string, email:string,description:string)=>Promise<void>
    loading:boolean;
    error:string|null
}

export const useRazorpay = ({ onSuccess, onError }: UseRazorpayProps): UseRazorpayReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (
    amount: number,
    name: string,
    email: string,
    description: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create order
      const order = await createRazorpayOrder(amount);

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.amount * 100, // Amount in paise
        currency: order.currency,
        name: 'IntervueX',
        description: description,
        order_id: order.id,
        handler: function (response: any) {
          onSuccess(response.razorpay_payment_id);
        },
        prefill: {
          name: name,
          email: email,
        },
        theme: {
          color: '#BC8CFF',
        },
        modal: {
         ondismiss: function () {
            onError('Payment cancelled');
          },
        },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error('Razorpay error:', err);
      setError(err.message || 'Failed to initiate payment');
      onError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

 return {
    initiatePayment,
    loading,
    error,
  };
};