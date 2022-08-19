import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../config/firebase.js";

export const app = initializeApp(firebaseConfig);

export const firestoreDb = getFirestore();
