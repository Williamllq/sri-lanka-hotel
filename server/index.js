const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('实际的Stripe_Secret_Key');

const app = express();
app.use(cors());
app.use(express.json());

// 处理支付意向
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method_types: ['card']
        });
        
        res.json({ 
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 处理支付成功的回调
app.post('/payment-success', async (req, res) => {
    const { paymentIntentId, bookingDetails } = req.body;
    
    try {
        // 这里可以添加预订信息到数据库
        // 发送确认邮件等
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 