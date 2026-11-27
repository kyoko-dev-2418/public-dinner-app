
import { Link, Navigate, useParams } from 'react-router-dom';
import './HostHome.css';
import This_Week_Menu from './This_Week_Menu';
import StepWarning from './StepWarning';




const HostHome = () => {
  const { hostId } = useParams();

  
  return (

    <>
      <div className="container">
        <StepWarning />
        <This_Week_Menu />

        <div className="Host_section Host_vote_section">
          <div className="section_title">
            <h3>家族の意見も聞いてみよう！</h3>
          </div>
          <p>アプリを共有すると、家族も簡単に投票できます。<br />
            招待URLの有効期限は3日です。<br />
            今すぐ家族を招待して、来週の投票に参加してもらいましょう！</p>
          <Link to={`/host/${hostId}/invite`} className="shopping_list_button shopping_list_button3">
            <p>さっそく家族を招待しよう</p>
          </Link>
        </div>
        <div className="Host_section">
          <div className="section_title">
            <h3>買い物リストを確認しよう！</h3>
          </div>
          <Link to={`/host/${hostId}/shopping-list`} className="shopping_list_button shopping_list_button1">
            <p>買い物リストはこちら</p>
          </Link>
        </div>
      </div>
    </>
  );
}

export default HostHome;