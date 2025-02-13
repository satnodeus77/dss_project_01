import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpWsLdgfAzD7Q2_i0ZKbucgBj96DtN0IU",
  authDomain: "dss-project-3bdaa.firebaseapp.com",
  projectId: "dss-project-3bdaa",
  storageBucket: "dss-project-3bdaa.firebasestorage.app",
  messagingSenderId: "562833420237",
  appId: "1:562833420237:web:4651689193b486625dde84"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
