import stripe from 'stripe';

const Stripe = new stripe(process.env.STRIPE_SECRET_KEY);

export default Stripe;
