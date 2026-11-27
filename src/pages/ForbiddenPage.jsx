import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ForbiddenPage.css';


const ForbiddenPage = () => {
  const navigate = useNavigate();
  return (
    <div className="ForbiddenPage">
      <div className="container">
        <div className="Step_inner">
          <h1>403 Forbidden</h1>
          <p>アクセス権限がありません。ログイン画面に戻ってください。</p>
          {/* ログイン画面に戻るボタン */}
          <button
            className='appbutton appbutton1'
            onClick={() => {
              // ログイン画面にリダイレクト
              navigate("/Creator-signup", { replace: true });
            }}
          >
            ログインへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForbiddenPage;