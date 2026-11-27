
import { collection, addDoc, where, query, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useState } from 'react';

import './GuestStep.css';
import { useGuestVote } from './GuestVoteProvider';





const GuestStep3 = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { menuList, setMenuList, setEditingIndex } = useOutletContext();

  const { guestId, currentWeekId, setVoted } = useGuestVote();

  const { hostId } = useParams();



  if (!menuList || menuList.length === 0) {
    return (<div className="container">
      <div className="Step_inner">
        <h4>メニューが未選択です</h4>
        <button
          className="appbutton appbutton1"
          onClick={() => navigate(`/guest/${hostId}`)}
        >
          カテゴリ選択へ戻る
        </button>
      </div>
    </div>
    );
  }

  const handleDeleteclick = (index) => {
    const newmenus = menuList.filter((_, i) => i !== index);
    setMenuList(newmenus)
  }

  const handleEdit = (index) => {
    setEditingIndex(index);
    navigate(`/guest/${hostId}/GuestStep2`); // Step2に戻る
  };

  const handleVoteAndNext = async () => {
    if (!guestId || !currentWeekId) {
      console.error("guestId または currentWeekId が未設定です");
      alert("通信準備中です。少し待ってからもう一度お試しください。");
      return;
    }



    setLoading(true);
    try {
      const votesRef = collection(db, "weeklyPlans", hostId, "week", currentWeekId, "votes");
      const q = query(votesRef, where("guestId", "==", guestId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        alert("この週はすでに投票済みです。");
        return;
      }

      for (const item of menuList) {
        await addDoc(votesRef, {
          guestId,
          menuId: item.menu?.id || "none",
          menuName: item.menu?.name || "不明なメニュー",
          day: item.day || "曜日未選択",
          createdAt: serverTimestamp(),
          voted: true,
        });

      }


      const weekRef = doc(db, "guestVotes", guestId, "weeks", currentWeekId);
      await setDoc(weekRef, {
        voted: true,
        createdAt: new Date(),
      });
      setVoted(true);

      alert("投票を保存しました！");


      setMenuList([]);
      navigate(`/guest/${hostId}/Guest_thanks`);

    } catch (error) {
      console.error(error);
      alert("投票に失敗しました");
    } finally {
      setLoading(false);
    }


  };
  return (

    <div className="GuestStep3">
      <div className="container">
        <div className="Step_inner">
          <img className="GuestStep_stepimg" src="/step3.png" alt="ステップ" />
          <h3>来週食べたい料理に投票しよう！</h3>

          <h4>投票一覧</h4>

          {menuList.map((selectitem, index) => (
            <ul key={index}>
              <li>
                <h4><span>メニュー名：</span>{selectitem.menu.name || "未選択"}</h4>
                <p>選択曜日：{selectitem.day || "曜日未選択"}</p>
                <div className="Gueststep3_box1">
                  <button
                    className='GuestStep3_button1'
                    onClick={() => { handleEdit(index) }}>
                    メニューを編集</button>
                  <button
                    onClick={() => handleDeleteclick(index)}
                  >
                    <img src="/8.png" alt="ゴミ箱" />
                    ゴミ箱
                  </button>
                </div>
              </li>
            </ul>

          ))}


          <div className="Gueststep3_box2">
            <button
              onClick={handleVoteAndNext}
              className='GuestStepbutton'
              disabled={!guestId || !currentWeekId || loading}
            >
              {loading ? "送信中..." : "投票する"}
            </button>
            <button
              className='GuestStepbutton2'
              onClick={() => {
                navigate(`/guest/${hostId}`);
              }}>
              別日の投票をする</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestStep3;