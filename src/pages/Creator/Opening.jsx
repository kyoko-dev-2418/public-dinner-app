import { useEffect, useState } from 'react';
import './CreatorStep.css';

const Opening = () => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true)
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`Opening ${fade ? "fade-out" : ""}`}>
      <div className="container">
        <div className="opening_inner">
          <img className="opening_img" src="/o1.png" alt="" />
          <h2>だれか決めて！<br />晩ごはん</h2>
        </div>
      </div>
    </div>
  )
}

export default Opening