
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import './GuestStep.css';
import { useGuestVote } from './GuestVoteProvider';




const GuestStep1 = () => {

  const navigate = useNavigate();
  const { setCategory } = useOutletContext();
  const { voted } = useGuestVote();
  const message = voted ? "投票ありがとう！来週また投票してね。" : "食べたい料理は何かな？？";

  const { hostId } = useParams();



  if (voted) {
    return (
      <div className="GuestStep1">
        <div className="container">
          <div className="Step_inner">
            <p className="gueststep1_message">{message}</p>

            <img className="guestthanks_img1" src="/g1.png" alt="thankyou" />
            <img className="guestthanks_img2" src="/g2.png" alt="女性" />
          </div>
        </div>
      </div>
    )
  }

  return (

    <div className="GuestStep1">
      <div className="container">
        <div className="Step_inner">



          <img className="GuestStep_stepimg" src="/step1.png" alt="ステップ" />

          <p className="gueststep1_message">{message}</p>

          <h3>来週食べたい料理に投票しよう！</h3>

          <h4>料理カテゴリを選択</h4>
          <button className='GuestStep1_button GuestStep1_button1'
            onClick={() => {
              setCategory("肉");
              navigate(`/guest/${hostId}/GuestStep2`);
            }}
          >
            <div className='GuestStep1_button_box'>
              <img className='GuestStep1_button_ingredientimg' src="/1.png" alt="肉" />
              <p>肉料理</p>
            </div>
            <img className='GuestStep1_button_arrow' src="/arrow4.png" alt="" />
          </button>

          <button className='GuestStep1_button GuestStep1_button2'
            onClick={() => {
              setCategory("魚");
              navigate(`/guest/${hostId}/GuestStep2`);
            }}
          >
            <div className='GuestStep1_button_box'>
              <img className='GuestStep1_button_ingredientimg' src="/2.png" alt="魚" />
              <p>魚料理</p>
            </div>
            <img className='GuestStep1_button_arrow' src="/arrow4.png" alt="" />
          </button>

          <button className='GuestStep1_button GuestStep1_button3'
            onClick={() => {
              setCategory("その他");
              navigate(`/guest/${hostId}/GuestStep2`);
            }}
          >
            <div className='GuestStep1_button_box'>
              <img className='GuestStep1_button_ingredientimg' src="/3.png" alt="卵" />
              <p>その他</p>
            </div>
            <img className='GuestStep1_button_arrow' src="/arrow4.png" alt="" />
          </button>



        </div>
      </div>
    </div>
  );
}

export default GuestStep1;