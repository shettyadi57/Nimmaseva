/**
 * firebase.ts — Nimma Seva Firebase Phone Authentication
 *
 * Provides:
 *  - setupRecaptcha(elementId)    → attaches invisible reCAPTCHA to a DOM div
 *  - sendFirebaseOTP(phone)       → sends real SMS OTP via Firebase
 *  - verifyFirebaseOTP(otp)       → confirms the OTP entered by the user
 *  - clearRecaptcha()             → resets reCAPTCHA widget (for retry)
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize only once (Vite HMR safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Holds the confirmation result returned after OTP is sent
let confirmationResult: ConfirmationResult | null = null;
// Holds the reCAPTCHA verifier instance (one per session)
let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Sets up an invisible reCAPTCHA verifier attached to a DOM element.
 * Must be called before sendFirebaseOTP.
 * Safe to call multiple times — reuses existing verifier.
 */
export const setupRecaptcha = (elementId: string): RecaptchaVerifier => {
  if (recaptchaVerifier) return recaptchaVerifier;

  recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved automatically — do nothing
    },
    'expired-callback': () => {
      clearRecaptcha();
    },
  });

  return recaptchaVerifier;
};

/**
 * Sends an OTP SMS to the given phone number (Indian format: +91XXXXXXXXXX).
 * Automatically prepends +91 if user enters a 10-digit local number.
 */
export const sendFirebaseOTP = async (phone: string): Promise<void> => {
  // Normalise: strip spaces/dashes, prepend +91 for Indian numbers
  const cleaned = phone.replace(/\D/g, '');
  const e164Phone = cleaned.startsWith('91') ? `+${cleaned}` : `+91${cleaned}`;

  const verifier = setupRecaptcha('firebase-recaptcha-container');
  confirmationResult = await signInWithPhoneNumber(auth, e164Phone, verifier);
};

/**
 * Verifies the OTP the user entered.
 * Returns true on success, throws an Error with a user-friendly message on failure.
 */
export const verifyFirebaseOTP = async (otp: string): Promise<boolean> => {
  if (!confirmationResult) {
    throw new Error('No OTP request found. Please send OTP first.');
  }
  await confirmationResult.confirm(otp);
  return true;
};

/**
 * Clears the reCAPTCHA verifier — call this when retrying after an error.
 */
export const clearRecaptcha = (): void => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  confirmationResult = null;
};
