
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBloR5wQnONpHFVyuMZNR--QYq8j-uMVPs",
  authDomain: "clothing-store-fer202.firebaseapp.com",
  projectId: "clothing-store-fer202",
  storageBucket: "clothing-store-fer202.firebasestorage.app",
  messagingSenderId: "448124588466",
  appId: "1:448124588466:web:d66ed09978927625efd4ab"
};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();