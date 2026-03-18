import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🔹 Your config (already correct)
const firebaseConfig = {
  apiKey: "AIzaSyCXcue1SOX_GN1a6LKkZeXxbWwN8-YT6Vg",
  authDomain: "gemini-dev-461308.firebaseapp.com",
  projectId: "gemini-dev-461308",
  storageBucket: "gemini-dev-461308.firebasestorage.app",
  messagingSenderId: "54041417021",
  appId: "1:54041417021:web:0a77ee20ba3ed35023e154"
};

// 🔹 Initialize app
const app = initializeApp(firebaseConfig);

// 🔹 Firestore with offline support (NEW API)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// 🔹 Auth
export const auth = getAuth(app);
