import { useNavigate } from 'react-router-dom';
import './CreatorStep.css';
import { useEffect, useState } from 'react';
import { auth, createInvite } from "../../firebase";
import VoteSectionLogic from '../../components/VoteSectionLogic';




const CreatorStep5 = ({ onFinish,uid }) => {
  const navigate = useNavigate();
  const [inviteUrl, setInviteUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  

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
        console.error("❌ 招待リンク生成失敗:", err);
        setError("招待リンクの発行に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    generateInvite();
  }, []);


  const handleFinish = () => {
    if (onFinish) onFinish();

    navigate(`/host/${uid}`, { replace: true });

  };



  return (
    <div className="CreateStep5">
      <div className="container">
        <img className="CreateStep-img" src="/p1.png" alt="" />

        <div className="CreateStep_inner">
          <img className="CreateStep_stepimg" src="/step3.png" alt="ステップ" />

          <VoteSectionLogic
            inviteUrl={inviteUrl}
            loading={loading}
            error={error}
          />


          <button
            className='CreateStepbutton'
            disabled={loading}
            onClick={handleFinish}>
            {loading ? "読み込み中・・・" : " 完了する"}
          </button>

        </div>

      </div>
    </div>
  )
}

export default CreatorStep5