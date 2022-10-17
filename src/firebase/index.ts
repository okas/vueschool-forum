import useAppConfig from "@/app-config";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const { firebase } = useAppConfig();

export const fabApp = initializeApp(firebase);

export const fabDb = getFirestore(fabApp);

export const fabAuth = getAuth(fabApp);

export const fabStor = getStorage(fabApp);
