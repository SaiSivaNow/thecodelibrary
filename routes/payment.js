const express = require('express')
const router = express.Router()
const config = require(`../utils.js`)
const base_url = config.BASE_URL;
const stripe = require('stripe')(config.STRIPE_SECRET_KEY);

router.get('/checkout', (req, res) => {
    res.sendFile(__dirname + '../public/checkout.html');
});

router.get('/success', (req, res) => {
    res.sendFile(__dirname + '../public/success.html');
});

router.get('/cancel', (req, res) => {
    res.sendFile(__dirname + '../public/cancel.html');
});


router.post('/create-checkout-session', async (req, res) => {

    const product = await stripe.products.create({
        name: 'Just Enough Java',
    });

    const price = await stripe.prices.create({
        unit_amount: 200,
        currency: 'inr',
        product: product.id,
    });

    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${base_url}/success`,
        cancel_url: `${base_url}/cancel`,
    });

    res.redirect(303, session.url);
});

module.exports=router;