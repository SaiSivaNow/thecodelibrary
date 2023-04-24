const express = require('express')
const router = express.Router()
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || 'prod';
const config = require(`../config/${env}.json`);
dotenv.config()
const base_url = config.BASE_URL;
const stripe = require('stripe')(config.STRIPE_SECRET_KEY);

router.get('/checkout', (req, res) => {
    res.sendFile('checkout.html', {root: __dirname+'/../public'});
});

router.get('/success', (req, res) => {
    res.sendFile('success.html', {root: __dirname+'/../public'});
});

router.get('/cancel', (req, res) => {
    res.sendFile('cancel.html', {root: __dirname+'/../public'});
});


router.post('/create-checkout-session', async (req, res) => {

    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: 'price_1N0Q64SBIGSHkrhqsSgWZR9T',
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${base_url}/pay/success`,
        cancel_url: `${base_url}/pay/cancel`,
    });

    res.redirect(303, session.url);
});

module.exports=router;