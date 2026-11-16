/* Yalla English – settings you can change without touching the app code. */
window.Y = window.Y || {};
Y.CONFIG = {
  // Google sign-in: paste the OAuth "Web client ID" from Google Cloud Console.
  // While empty, the Google button creates a local profile on this device only.
  GOOGLE_CLIENT_ID: '',

  // Subscription
  PRICE_ILS: 49,          // monthly price in shekels
  TRIAL_DAYS: 7,          // free trial length, 0 = no trial
  // Link to your payment page (Stripe / PayPlus / Tranzila / Grow ...).
  // While empty, "subscribe" unlocks Plus on this device without charging (demo).
  PAYMENT_URL: '',

  // Free content: these units are fully open, plus the first lesson of every other unit.
  FREE_UNITS: ['u1', 'u2'],

  MAX_HEARTS: 5,
  HEART_MINUTES: 30       // minutes to regenerate one heart
};
