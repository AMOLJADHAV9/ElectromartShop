import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RbYFbZvXenhjVA',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'jETTTowzDmG21TFG0O1wFF4d',
});

// Create order endpoint
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };
    
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Verify payment endpoint
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Create the expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'jETTTowzDmG21TFG0O1wFF4d')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    // Compare signatures
    const isSignatureValid = expectedSignature === razorpay_signature;
    
    if (isSignatureValid) {
      res.json({ 
        success: true, 
        orderId: razorpay_order_id, 
        paymentId: razorpay_payment_id, 
        signature: razorpay_signature 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
});

export default router;