export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const displayRazorpay = async (orderData, onSuccess, onFailure) => {
  const res = await loadRazorpay();

  if (!res) {
    alert('Razorpay SDK failed to load. Please check your connection.');
    return;
  }

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: orderData.amount,
    currency: orderData.currency,
    name: 'Hypz Storage',
    description: 'Storage Plan Subscription',
    order_id: orderData.orderId,
    handler: function (response) {
      onSuccess({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
    },
    prefill: {
      email: orderData.email || '',
      contact: orderData.contact || '',
    },
    theme: {
      color: '#0ea5e9',
    },
    modal: {
      ondismiss: function() {
        onFailure('Payment cancelled');
      }
    }
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};
