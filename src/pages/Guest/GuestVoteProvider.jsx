import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { getWeekId } from "./GetWeekId";

const GuestVoteContext = createContext();

export const GuestVoteProvider = ({ children }) => {
  const [currentWeekId, setCurrentWeekId] = useState("");
  const [voted, setVoted] = useState(false);

  const [guestId, _setGuestId] = useState(() => {
    let Id = localStorage.getItem("guestId");
    if (!Id) {
      Id = `guest-${crypto.randomUUID().slice(0, 8)}`;
      localStorage.setItem("guestId", Id);
    } else {
      // console.log("既存guestId:", Id);
    }
    return Id;
  });

  // 今週のWeekIdを取得
  useEffect(() => {
    const week = getWeekId(0);
    setCurrentWeekId(week);
  }, []);

  // Firestoreで投票済み確認
  useEffect(() => {
    if (!guestId || !currentWeekId) return;
    const checkVoteStatus = async () => {
      const weekRef = doc(db, "guestVotes", guestId, "weeks", currentWeekId);
      const snap = await getDoc(weekRef);
      if (snap.exists()) {
        setVoted(true);
      } else {
        setVoted(false);
      }
    };
    checkVoteStatus();
  }, [guestId, currentWeekId]);

  return (
    <GuestVoteContext.Provider
      value={{
        guestId,
        currentWeekId,
        voted,
        setVoted,
      }}
    >
      {children}
    </GuestVoteContext.Provider>
  );
};

export const useGuestVote = () => useContext(GuestVoteContext);
