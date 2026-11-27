import { useCallback, useEffect, useState } from "react";

import { db } from "../../firebase";
import { getWeekId } from "../Guest/GetWeekId";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import '../Host/HostHome.css';
import './Guest_this_Week_Menu.css';

const Guest_This_Week_Menu = () => {

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();


  const { hostId } = useParams();


  // Firestore から今週の献立を取得
  const fetchMenus = useCallback(async () => {
    try {
      const weekId = getWeekId(0);
      const menusRef = collection(db, "weeklyPlans", hostId, "week", weekId, "menus");
      const snap = await getDocs(menusRef);

      if (snap.empty) {
        setMenus([]);
      } else {
        const data = snap.docs.map((d) => d.data());
        const order = ["月", "火", "水", "木", "金", "土", "日"];
        data.sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
        setMenus(data);
      }
    } catch (err) {
      console.error("献立データ取得エラー:", err);
    } finally {
      setLoading(false);
    }
  }, [hostId]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);




  if (loading) {
    return (
      <div className="loading-container">
        <p>献立を読み込み中...</p>
        <div className="spinner"></div>
      </div>
    )
  }



  return (
    <div className="Guest_this_Week_Menu">
      <div className="container">
        <div className="This_Week_Menu">
          <div className="section_title">
            <img src="/7.png" alt="カレンダーのアイコン" />
            <h3>今週の献立</h3>
          </div>

          {!menus.length && (
            <p>今週の献立データがありません</p>

          )}

          {menus.length > 0 && (
            <div className="This_Week_Menu_list">
              {menus.map((menu) => (

                <div key={menu.date + menu.day}            >
                  <div className="This_Week_Menu_titlebox">
                    <div>
                      <p className='This_Week_Menu_day'>
                        <span className='This_Week_Menu_weekday'>{menu.day}</span>
                        {menu.date}
                      </p>
                      <h4 className='This_Week_Menu_title'>
                        <span className="menu-name">{menu.name}</span>
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>



          )}


        </div>

        <button
          className="appbutton appbutton1"
          onClick={() => navigate(`/guest/${hostId}`)}
        >
          TOPへ戻る
        </button>

      </div>
    </div>



  )
}

export default Guest_This_Week_Menu;