

import { useNavigate, useParams } from "react-router-dom";
import './Invite.css';
import { auth, createInvite } from "../../firebase";
import { useEffect, useState } from "react";
import VoteSectionLogic from "../../components/VoteSectionLogic";



const Invite = () => {
  const navigate = useNavigate();
  const [inviteUrl, setInviteUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hostId } = useParams();




  useEffect(() => {
    const generateInvite = async () => {

      let user = auth.currentUser;



      if (!user) {
        setError("ログインが必要です");
        return;
      }
      try {
        // 🔹 最新トークン取得
        await user.getIdToken(true);

        // 🔹 招待URL生成
        const result = await createInvite();
    
        setInviteUrl(result?.url || result);
      } catch (err) {
        console.error(" 招待リンク生成失敗:", err);
        setError("招待リンクの発行に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    generateInvite();
  }, []);

  return (
    <div className="Invite">
      <div className="container">
        <div className="CreateStep_inner">
          <VoteSectionLogic
            inviteUrl={inviteUrl}
            loading={loading}
            error={error}
          />

          <button
            className='CreateStepbutton'
            onClick={() => navigate(`/host/${hostId}`)}
            disabled={loading}>
            {loading ? "読み込み中・・・" : "TOPへ戻る"}
          </button>
        </div>
      </div>
    </div>
  )
}


export default Invite