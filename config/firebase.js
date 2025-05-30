import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDRsNyMau_M6vZyseiZxtNA00I5nwQ9zpg",
    authDomain: "montesion-df492.firebaseapp.com",
    projectId: "montesion-df492",
    storageBucket: "montesion-df492.firebasestorage.app",
    messagingSenderId: "271614706494",
    appId: "1:271614706494:web:238e93239e6d62e0fba26f",
    measurementId: "G-30PCXQD3TT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);