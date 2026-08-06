/**
 * firebase.ts — Nimma Seva Firebase Phone Authentication
 *
 * Provides:
 *  - setupRecaptcha(elementId)    → attaches invisible reCAPTCHA to a DOM div
 *  - sendFirebaseOTP(phone)       → sends real SMS OTP via Firebase
 *  - verifyFirebaseOTP(otp)       → confirms the OTP entered by the user
 *  - clearRecaptcha()             → resets reCAPTCHA widget (for retry)
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBoxvI8h0tpMk-YHNq7LaGgqiBjU7yVQlA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nimmaseva-73159.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nimmaseva-73159",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nimmaseva-73159.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "239897408131",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:239897408131:web:010086dfeba6d07c6961b6",
};

// Safe initialization (prevents blank screen crash if env vars are missing or firebase fails)
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  authInstance = getAuth(app);
} catch (e) {
  console.warn('Firebase init warning:', e);
}

export const auth = authInstance;

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
  if (!authInstance) {
    throw new Error('Firebase Auth is not initialized');
  }

  recaptchaVerifier = new RecaptchaVerifier(authInstance, elementId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved automatically
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
  if (!authInstance) {
    throw new Error('Firebase Auth is not available.');
  }

  const cleaned = phone.replace(/\D/g, '');
  const e164Phone = cleaned.startsWith('91') ? `+${cleaned}` : `+91${cleaned}`;

  const verifier = setupRecaptcha('firebase-recaptcha-container');
  confirmationResult = await signInWithPhoneNumber(authInstance, e164Phone, verifier);
};

/**
 * Verifies the OTP the user entered.
 */
export const verifyFirebaseOTP = async (otp: string): Promise<boolean> => {
  if (!confirmationResult) {
    throw new Error('No OTP request found. Please send OTP first.');
  }
  await confirmationResult.confirm(otp);
  return true;
};

/**
 * Clears the reCAPTCHA verifier.
 */
export const clearRecaptcha = (): void => {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (_) {}
    recaptchaVerifier = null;
  }
  confirmationResult = null;
};
