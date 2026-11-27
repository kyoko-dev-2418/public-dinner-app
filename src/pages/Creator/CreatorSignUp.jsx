import { useEffect, useState } from "react";
import CreatorStep1 from "./CreatorStep1";
import CreatorStep2 from "./CreatorStep2";
import CreatorStep3 from "./CreatorStep3";
import CreatorStep5 from "./CreatorStep5";
import { useLocation } from "react-router-dom";
import Opening from "./Opening";

const CreatorSignUp = ({ onNext, setIsFirstTime, user }) => {
  const location = useLocation();
  const initialStep = location.state?.step || 1;  // ← step に合わせる
  const initialData = location.state?.formData || {
    email: '',
    password: '',
    mealDays: 0,
    fishDays: 0,
    otherDays: 0,
    selectMenus: [],
    voteDeadline: '',
  };
  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState(initialData);

  const [showOpening, setShowOpening] = useState(step === 1);

  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        setShowOpening(false);
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNextStep = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(prev => prev + 1)

  }

  if (showOpening) {
    return <Opening />;
  }
  return (
    <div>
      {step === 1 && <CreatorStep1 onNext={handleNextStep} setIsFirstTime={setIsFirstTime} />}
      {step === 2 && <CreatorStep2 onNext={handleNextStep} />}
      {step === 3 && (
        <CreatorStep3
          {...formData}
          onNext={handleNextStep}
        />
      )}
      {step === 4 && <CreatorStep5 uid={user?.uid} onFinish={onNext} />}
    </div>

  )
}


export default CreatorSignUp;