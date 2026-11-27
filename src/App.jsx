

import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";

// HOST
import LayoutHost from "./components/LayoutHost";
import HostHome from "./pages/Host/HostHome";
import ShoppingList from "./pages/Host/ShoppingList";
import Invite from "./pages/Host/Invite";
import Opening from "./pages/Creator/Opening";
import MenuEdit1 from "./pages/MenuEdit/MenuEdit1";
import MenuEdit2 from "./pages/MenuEdit/MenuEdit2";
import MenuEdit3 from "./pages/MenuEdit/MenuEdit3";

// GUEST（guest に統一した部分）
import LayoutGuest from "./components/LayoutGuest";
import GuestStep1 from "./pages/Guest/GuestStep1";
import GuestStep2 from "./pages/Guest/GuestStep2";
import GuestStep3 from "./pages/Guest/GuestStep3";
import Guest_thanks from "./pages/Guest/Guest_thanks";
import Guest_This_Week_Menu from "./pages/Guest/Guest_This_Week_Menu";

// Creator
import CreatorSignUp from "./pages/Creator/CreatorSignUp";

// その他
import Join from "./pages/Join";
import ForbiddenPage from "./pages/ForbiddenPage";
import { doc, onSnapshot } from "firebase/firestore";
import HostGuard from "./pages/Host/HostGuard";




// 認証状態を取得
function useAuthReady() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  return { user, authReady };
}


// Firestore の setup 情報を取得する

function useSetupInfo(user) {
  const [setupInfo, setSetupInfo] = useState(null);

  useEffect(() => {
    if (!user) {
      setSetupInfo(null);
      return;
    }

    const ref = doc(db, "users", user.uid, "setup", "info");
    const unsub = onSnapshot(ref, (snap) => {
      setSetupInfo(snap.data() || null);
    });

    return unsub;
  }, [user]);

  return setupInfo;
}



//  "/" でのトップアクセス分岐
function RootRedirect({ user }) {
  return user
    ? <Navigate to={`/host/${user.uid}`} replace />
    : <Navigate to="/Creator-signup" replace />;
}

// アプリ本体
export default function App() {
  const { user, authReady } = useAuthReady();
  const setupInfo = useSetupInfo(user);  // ← Firestore setup 状態を取得


  if (!authReady) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
        <div className="spinner"></div>
      </div>
    );
  }





  return (
    <BrowserRouter>
      <Routes>

        {/* "/" は user がいるかどうかで分岐 */}
        <Route path="/" element={<RootRedirect user={user} />} />

        {/* Creator-signup（ログイン済みなら入れない） */}
        <Route path="/Creator-signup" element={<CreatorSignupWrapper user={user} setupInfo={setupInfo} />} />

        {/* Host 配下（ログイン必須） */}
        <Route path="/host/:hostId/*" element={<HostGuard user={user} />}>
          <Route element={<LayoutHost />}>
            <Route index element={<HostHome />} />
            <Route path="shopping-list" element={<ShoppingList />} />
            <Route path="invite" element={<Invite />} />
            <Route path="Opening" element={<Opening />} />
            <Route path="MenuEdit1" element={<MenuEdit1 />} />
            <Route path="MenuEdit2" element={<MenuEdit2 />} />
            <Route path="MenuEdit3" element={<MenuEdit3 />} />
          </Route>
        </Route>
       
        {/* Guest */}
        <Route path="/guest/*" element={<LayoutGuest user={user} />}>
          <Route index element={<GuestStep1 />} />
          <Route path=":hostId" element={<GuestStep1 />} />
          <Route path=":hostId/GuestStep2" element={<GuestStep2 />} />
          <Route path=":hostId/GuestStep3" element={<GuestStep3 />} />
          <Route path=":hostId/Guest_thanks" element={<Guest_thanks />} />
          <Route path=":hostId/GuestThisWeekMenu" element={<Guest_This_Week_Menu />} />
        </Route>

        <Route path="/join" element={<Join />} />

        <Route path="/403" element={<ForbiddenPage />}  />

        {/* 404 */}
        <Route path="*" element={<h1>Not Found Page</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

// --- Creator-signup へのガード ---
function CreatorSignupWrapper({ user, setupInfo }) {
  const location = useLocation();
  const [_isFirstTime, setIsFirstTime] = useState(true);
  const reset = location.state?.reset === true;

  // user がいない → 入れる
  if (!user) return <CreatorSignUp user={user} setIsFirstTime={setIsFirstTime} />;

  // ② Firestore の setup 完了済み & reset ではない → 入れない
  if (setupInfo?.stepAllDone && !reset) {
    return <Navigate to={`/host/${user.uid}`} replace />;
  }

  // ③ reset = true または未完了 → 入れる
  return <CreatorSignUp user={user} setIsFirstTime={setIsFirstTime} />;
}

