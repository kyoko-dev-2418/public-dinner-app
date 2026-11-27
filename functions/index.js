

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

import { v4 as uuid } from "uuid";
import { defineSecret } from "firebase-functions/params";


const APP_ORIGIN = defineSecret("APP_ORIGIN");

// Firebase Admin 初期化
initializeApp();

const db = getFirestore();
const auth = getAuth();

/**
 * 招待コードを生成して URL を返す (ホスト用)
 */
export const createInvite = onCall(
 {
    region: "asia-northeast1",
    secrets: [APP_ORIGIN],   
  },

async (req) => {
    const origin = req.rawRequest.headers.origin;
    const appOrigin = APP_ORIGIN.value();

    if (!appOrigin) {
      console.error("APP_ORIGIN is not set in secrets");
      throw new HttpsError("internal", "Server config error");
    }

    if (origin !== appOrigin) {
      console.error("Invalid origin:", origin);
      throw new HttpsError("permission-denied", "Invalid origin");
    }

    if (!req.auth) throw new HttpsError("unauthenticated", "Sign-in required");

    const hostId = req.auth.uid;
    const code = uuid().replace(/-/g, "");

    await db.collection("invites").doc(code).set({
      hostId,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 259200000), // 3日
      uses: 0,
      maxUses: 5,
    });

    return { url: `${appOrigin}/join?code=${code}` };
  }
);


/**
 * 招待コードでゲストをログインさせる (ゲスト用)
 */
export const exchangeInvite = onCall(
  {
    region: "asia-northeast1",
    secrets: [APP_ORIGIN],   
  },  
  async (req) => {
    const origin = req.rawRequest.headers.origin;
    const appOrigin = APP_ORIGIN.value();

    if (!appOrigin) {
      console.error("APP_ORIGIN is not set");
      throw new HttpsError("internal", "Server config error");
    }

    if (origin !== appOrigin) {
      console.error("Invalid origin:", origin);
      throw new HttpsError("permission-denied", "Invalid origin");
    }

    const code = req.data.token;
    if (!code) throw new HttpsError("invalid-argument", "招待コードが必要です");

    const docRef = db.collection("invites").doc(code);
    const doc = await docRef.get();

    if (!doc.exists)
      throw new HttpsError("not-found", "無効な招待コードです");

    const inviteData = doc.data();

    if (inviteData.expiresAt && inviteData.expiresAt.toDate() < new Date()) {
      throw new HttpsError("failed-precondition", "招待コードの有効期限が切れています");
    }

    if (inviteData.maxUses && inviteData.uses >= inviteData.maxUses) {
      throw new HttpsError("failed-precondition", "招待コードの使用回数が上限です");
    }

    const guestUid = `guest_${code}_${Math.floor(Math.random() * 1_000_000)}`;
    const customToken = await auth.createCustomToken(guestUid);

    await docRef.update({
      uses: FieldValue.increment(1),
    });

    return {
      customToken,
      hostId: inviteData.hostId,
    };
  }
);
