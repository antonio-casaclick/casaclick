import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFhxDwJAWrCuY0jYUO2xuVQWFxNMITNK8",
  authDomain: "casaclick-66471.firebaseapp.com",
  projectId: "casaclick-66471",
  storageBucket: "casaclick-66471.firebasestorage.app",
  messagingSenderId: "813093034668",
  appId: "1:813093034668:web:461e21876ab4c188215d09"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
