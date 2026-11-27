
import { useState } from 'react';
import './CreatorStep.css';
import { auth, db, signInWithGoogleUnified } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';




const CreatorStep1 = ({ onNext, setIsFirstTime }) => {
  // サインアップ用
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // ログイン用
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signerror, setSignError] = useState("");
  const [loginerror, setLoginError] = useState("");
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async (e) => {
    e.preventDefault();
    if (isSignupLoading) return;
    setIsSignupLoading(true);
    setSignError("");
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          role: "host",
          createdAt: serverTimestamp(),
        });
      }
      

      onNext();
    } catch (err) {
      console.error("❌ サインアップ失敗:", err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setSignError("このメールアドレスは既に登録されています。");
          break;
        case "auth/invalid-email":
          setSignError("メールアドレスの形式が正しくありません。");
          break;
        case "auth/weak-password":
          setSignError("パスワードは6文字以上にしてください。");
          break;
        default:
          setSignError("サインアップに失敗しました。");
      }
    } finally {
      setIsSignupLoading(false);
    }
  };

  // 🔹 Googleサインアップ、ログイン処理
  const handleNextGoogle = async () => {
    try {
      
      await setPersistence(auth, browserLocalPersistence);
      const user = await signInWithGoogleUnified();
      if (!user || !user.email) {
        throw new Error("Googleユーザー情報を取得できませんでした");
      }
      const googleEmail = user.email;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      const isFirst = !docSnap.exists();
      if (isFirst) {
        await setDoc(userRef, {
          email: googleEmail,
          role: "host",
          createdAt: serverTimestamp(),
        });
        onNext();
        return;
      }
      
      setIsFirstTime(isFirst);
      navigate(`/host/${user.uid}`, { replace: true });
    } catch (e) {
      console.error(" Googleサインアップ失敗:", e);
      switch (e.code) {
        case "auth/popup-closed-by-user":
          setSignError("認証ポップアップが閉じられました。もう一度お試しください。");
          break;
        case "auth/cancelled-popup-request":
          setSignError("認証処理がキャンセルされました。");
          break;
        default:
          setSignError("サインアップに失敗しました。もう一度お試しください。");
      }
    }
  }

  const emailLogin = async (e) => {
    e.preventDefault();

    if (isLoginLoading) return;
    setIsLoginLoading(true);
    setLoginError("");
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const uid = userCredential.user.uid;
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        onNext({ loginEmail, loginPassword });
      } else {
        setIsFirstTime(false);
        navigate(`/host/${uid}`, { replace: true });
      }

    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          setLoginError("メールアドレスの形式が正しくありません。");
          break;
        case "auth/user-not-found":
          setLoginError("ユーザーが存在しません。");
          break;
        case "auth/wrong-password":
          setLoginError("パスワードが間違っています。");
          break;
        default:
          setLoginError("ログインに失敗しました。");
      };
    } finally {
      setIsLoginLoading(false);
    }
  };

 



  return (
    <div className="CreateStep1">
      <div className="container">
        <img className="CreateStep-img" src="/p1.png" alt="" />

        <div className="CreateStep_inner">
          <div className="CreateStep1_box1">
            <h2>Sign up</h2>
           
            <form onSubmit={handleNext} className="CreateStep1_box1_inner1">
              <div className="inputGroup">
                <label htmlFor="signupEmail">Email</label>
                <input
                  type="email"
                  id="signupEmail"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  aria-invalid={!!signerror} 
                />
              </div>
              <div className="inputGroup">
                <label htmlFor="signupPassword">Password</label>
                <input type="password"
                  id="signupPassword"
                  placeholder="password"
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  aria-invalid={!!signerror} 
                />
              </div>

              <button
                className='CreateStepbutton appbutton1'
                type='submit'
                disabled={isSignupLoading}
              >
                {isSignupLoading ? "送信中…" : "Sign up"}
              </button>

            </form>
            <div className="CreateStep1_box1_inner2">
              <button onClick={handleNextGoogle} className='appbutton2'>Googleで登録</button>
            </div>
            {signerror && <p style={{ color: "red" }}>{signerror}</p>}
          </div>

          <div className="CreateStep1_box2">
            <h2>Login</h2>
            
            <form onSubmit={emailLogin} className="CreateStep1_box2_inner1">
              <div className="inputGroup">
                <label htmlFor="loginEmail">Email</label>
                <input
                  type="email"
                  id="loginEmail"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  aria-invalid={!!loginerror}
                />
              </div>
              <div className="inputGroup">
                <label htmlFor="loginPassword">Password</label>
                <input
                  type="password"
                  id="loginPassword"
                  placeholder="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  aria-invalid={!!loginerror}
                />
              </div>
              <button type='submit' className='appbutton3' disabled={isLoginLoading}> {isLoginLoading ? "ログイン中…" : "ログイン"}</button>
            </form>
            <div className="CreateStep1_box2_inner2">
              <button onClick={handleNextGoogle} className='appbutton4'>Googleでログイン</button>
            </div>

            {loginerror && <p style={{ color: "red" }}>{loginerror}</p>}
          </div>


        </div>
      </div>
    </div>
  )
}

export default CreatorStep1