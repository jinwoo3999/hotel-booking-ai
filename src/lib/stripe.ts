import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Warning: STRIPE_SECRET_KEY is not set. Stripe payments will not work.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

export async function createPaymentIntent(amount: number, currency: string = "vnd", metadata?: Record<string, string>) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe yêu cầu số tiền ở đơn vị nhỏ nhất (VND không có thập phân)
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata || {},
    });
    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}

export async function confirmPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error;
  }
}


