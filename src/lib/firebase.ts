// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5FNJt-kK5HiFtb0XRbmmcyJkaRAGaam8",
  authDomain: "vanu-oragnic-pvt-ltd.firebaseapp.com",
  projectId: "vanu-oragnic-pvt-ltd",
  storageBucket: "vanu-oragnic-pvt-ltd.appspot.com",
  messagingSenderId: "1041826459372",
  appId: "1:1041826459372:web:2138e7477ecbaf835a3fc9",
  measurementId: "G-1DPH9N8L6S"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, analytics };
