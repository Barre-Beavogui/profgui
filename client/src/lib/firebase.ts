import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
try {
  if (getApps().length === 0 && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  } else if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    // If no config and no app, create a dummy app object to avoid export errors
    // but log the warning.
    console.warn("Firebase config is missing. Profile photos and chat will not work.");
    app = { delete: () => Promise.resolve() } as any;
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
  app = { delete: () => Promise.resolve() } as any;
}

export const auth = app.delete ? null : getAuth(app);
export const db = app.delete ? null : getFirestore(app);
export const storage = app.delete ? null : getStorage(app);

export default app;
