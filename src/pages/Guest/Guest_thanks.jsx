
import './GuestStep.css';
import { useNavigate, useParams } from 'react-router-dom';



const Guest_thanks = () => {
  const navigate = useNavigate();

  const { hostId } = useParams();



  return (

    <div className="Guest_thanks">
      <div className="container">
        <div className="Step_inner">

          <img className="guestthanks_img1" src="/g1.png" alt="thankyou" />
          <img className="guestthanks_img2" src="/g2.png" alt="女性" />


          <div className="Guest_thanks_box">
            <h3>来週もまた投票してね!</h3>
            <button className='GuestStepbutton' onClick={() => navigate(`/guest/${hostId}`)}>
              TOPに戻る
            </button>
          </div>

        </div>

        <img src="/g3.png" alt="女性" />
      </div>
    </div>

  );
}

export default Guest_thanks;