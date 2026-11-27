




import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithCustomToken,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// app 初期化
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Firestore
const db = getFirestore(app);

// Functions（本番は asia-northeast1）
const functions = getFunctions(app, "asia-northeast1");

// ローカルエミュレーター
if (import.meta.env.DEV) {
  console.log("DEV モード: Firebase Emulator に接続します");
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
}

// =======================
// 公開関数
// =======================

// 本番用 Google ログイン（ホスト用）
export async function signInWithGoogleUnified() {
  if (import.meta.env.DEV) {
    throw new Error("ローカルではGoogleログイン不可。テストログインを使用してください");
  }
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// 招待URL生成（Host 用）
export async function createInvite() {
  const fn = httpsCallable(functions, "createInvite");
  const res = await fn();
  // Cloud Functions 側で { url: "https://xxx" } を返している前提
  return res.data.url;
}

//  招待トークン交換（Guest 用カスタムトークンログイン）
export async function exchangeInvite(token) {
  const fn = httpsCallable(functions, "exchangeInvite");
  const res = await fn({ token });

  const { customToken, hostId } = res.data;

  // ゲストとしてカスタムトークンでログイン
  await signInWithCustomToken(auth, customToken);

  // 画面側で「誰の部屋に入ったか」など表示したいなら hostId を返す
  return hostId;
}

// 共通で使いたいものを export
export { app, auth, provider, db, functions };


