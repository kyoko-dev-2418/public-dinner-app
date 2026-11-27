import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from '../firebase';
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";


const Header_Guest = () => {
  const navigate = useNavigate();
  const [isHost, setIsHost] = useState(false);
 const { hostId } = useParams();


  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setIsHost(false);
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      const docData = docSnap.exists() ? docSnap.data() : null;

      const isRealHostViewingAsGuest =
        docData &&
        docData.role === "host" &&
        user.uid === hostId;

      setIsHost(isRealHostViewingAsGuest);

    } catch (error) {
      console.error("Error reading user role:", error);
      setIsHost(false);
    }
  });

  return () => unsubscribe();
}, [hostId]);


  return (
    <>
      <header>
        <div className="HeaderTop HeaderTop_Guest">
          <div className="container">
            <button className="header_app_title">
              <img src="/app.png" alt="アプリのアイコン" />
              <h1>だれか決めて！晩ごはん</h1>
            </button>
            <div className="header_mode">
              <img src="/m2.png" alt="ナイフフォーク" />
              <h2>食べる人モード</h2>
            </div>
          </div>
        </div>
        <div className="HeaderBottom HeaderBottom_Guest">
          <div className="container">
            <button
            className="guest_menu_button"
            onClick={()=>navigate(`/guest/${hostId}/GuestThisWeekMenu`)}
            >今週の献立
            </button>

            {isHost && (
              <button
                className="Toggle_mode Toggle_mode_Guest"
                onClick={() => {
                  navigate(`/host/${hostId}`);
                }}>
                <img className="Toggle_mode_img" src="/m1.png" alt="" />
                <p>作る人モード切替</p>
                <img className="arrow" src="/arrow2.png" alt="" />
              </button>
            )}



          </div>


        </div>
      </header>




    </>
  )
}

export default Header_Guest