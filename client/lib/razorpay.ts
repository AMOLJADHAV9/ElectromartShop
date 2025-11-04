// Razorpay service for handling payments
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay SDK
export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create Razorpay order by calling backend API
export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  try {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
      }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to create order');
    }
    
    return data.order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Verify payment by calling backend API
export const verifyPayment = async (paymentData: any) => {
  try {
    const response = await fetch('/api/payment/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Process payment
export const processPayment = async (
  order: any,
  paymentOptions: {
    name: string;
    description: string;
    customerName: string;
    customerEmail: string;
    customerContact: string;
  }
) => {
  return new Promise((resolve, reject) => {
    const options = {
      key: 'rzp_test_RbYFbZvXenhjVA', // Your Razorpay Key ID
      amount: order.amount,
      currency: order.currency,
      name: paymentOptions.name,
      description: paymentOptions.description,
      order_id: order.id,
      handler: async function (response: any) {
        try {
          // Verify payment with backend
          const verification = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          
          if (verification.success) {
            resolve(response);
          } else {
            reject(new Error('Payment verification failed'));
          }
        } catch (error) {
          reject(error);
        }
      },
      prefill: {
        name: paymentOptions.customerName,
        email: paymentOptions.customerEmail,
        contact: paymentOptions.customerContact,
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response);
      reject(response);
    });
    rzp.open();
  });
};