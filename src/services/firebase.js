// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// As configurações serão injetadas pelo ambiente de produção
// Para o desenvolvimento local, ele usa as configurações do emulador ou um placeholder.
const firebaseConfig = {
  apiKey: "AIzaSyBh1wvCTZDbtqq8A9tUIxycPbSCZ32CZ2E",
  authDomain: "ti-atr.firebaseapp.com",
  projectId: "ti-atr",
  storageBucket: "ti-atr.firebasestorage.app",
  messagingSenderId: "356041592531",
  appId: "1:356041592531:web:dc105834e25d5f18eb0e26",
  measurementId: "G-M83F2XTFQ5"
};

// --- Inicialização dos serviços Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "ouaue-mvp-refatorado-v1"; // ID da nossa aplicação

export { db, auth, appId };