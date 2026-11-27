import '../pages/Creator/CreatorStep.css';
import { useState } from 'react';






const VoteSectionLogic = ({ inviteUrl, loading, error }) => {
  const [copied, setCopied] = useState(false);



  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl)
      .then(() => setCopied(true))
      .catch(() => alert("コピーできませんでした。"));

    setTimeout(() => setCopied(false), 2000);
  };

  const handleLine = () => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(inviteUrl)}`
    window.open(lineUrl, '_blank');
  }

  if (loading) return (
    <div className="loading-container">
      <p>招待リンクを作成中です…</p>
      <div className="spinner"></div>
    </div>
  );
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <h3>家族の意見も聞いてみよう！</h3>

      <p className="CreateStep_tex1">アプリを共有すると、家族も簡単に投票できます。<br />
        招待URLの有効期限は3日です。
        <br />今すぐ家族を招待して、来週の投票に参加してもらいましょう！</p>

      <div className="introduction_box">
        <p className="introduction_url">{inviteUrl}</p>
        <div className="introduction_box_inner">
          <button onClick={handleCopy} className='appbutton3'>{copied ? "コピーしました" : "コピー"}</button>
          <button onClick={handleLine} className='appbutton3'>LINEで送る</button>
        </div>
      </div>

    </>

  )
}

export default VoteSectionLogic