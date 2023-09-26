import stripe from 'stripe';

const Stripe = new stripe.Stripe(process.env.STRIPE_SECRET_KEY);

export default Stripe;
