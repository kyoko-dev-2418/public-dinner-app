
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { exchangeInvite } from "../firebase";

export default function Join() {
  const [params] = useSearchParams();
  const code = params.get("code"); // URLパラメータ
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const joinGuest = async () => {
      if (!code) {
        setError("招待コードがありません");
        setLoading(false);
        navigate("/error?reason=missing_code", { replace: true });
        return;
      }

      try {
        const hostId = await exchangeInvite(code);
        navigate(`/guest/${hostId}`, { replace: true });
      } catch (e) {
        console.error("ゲストログイン失敗:", e);
        setError("無効な招待リンクです");
        setLoading(false);
        navigate("/error?reason=invalid_invite", { replace: true });
      }
    };

    joinGuest();
  }, [code, navigate]);

  if (loading) return (
          <div className="loading-container">
            <p>ゲストログイン中・・・</p>
            <div className="spinner"></div>
          </div>
        ) ;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  return null;
}