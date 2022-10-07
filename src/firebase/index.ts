import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../config/firebase.js";

export const fabApp = initializeApp(firebaseConfig);

export const fabDb = getFirestore(fabApp);

export const fabAuth = getAuth(fabApp);

export const fabStor = getStorage(fabApp);
