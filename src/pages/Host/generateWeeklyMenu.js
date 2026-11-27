import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { getWeekId } from "../Guest/GetWeekId";
import { v4 as uuidv4 } from "uuid";


export const generateWeeklyMenu = async (hostId, userId) => {

  // 投票を読む週（前週）
  const voteWeekId = getWeekId(-1);
  const voteWeekRef = doc(db, "weeklyPlans", hostId, "week", voteWeekId);

  // 献立を作る週（今週）
  const menuWeekId = getWeekId(0);
  const menuWeekRef = doc(db, "weeklyPlans", hostId, "week", menuWeekId);


  // 前週の投票を読む
  const votesSnap = await getDocs(collection(voteWeekRef, "votes"));



  const votes = votesSnap.docs.map((d) => d.data());


  if (votes.length === 0) {
    console.warn("前週の投票データがありません");
  }

  const setupSnap = await getDoc(doc(db, "users", userId, "setup", "info"));
  const setup = setupSnap.data() || {};
  const { mealDays = 4, fishDays = 2, otherDays = 2 } = setup;


  const menuSnap = await getDocs(collection(db, "availableMenus", userId, "menus"))
  const allMenus = menuSnap.docs.map((d) => ({
    id: d.id,        
    ...d.data(),
  }));
  const meatMenus = allMenus.filter(m => m.category === "肉");
  const fishMenus = allMenus.filter(m => m.category === "魚");
  const otherMenus = allMenus.filter(m => m.category !== "肉" && m.category !== "魚");



  const menuMap = new Map(allMenus.map(m => [m.id, m]));

  const days = ["月", "火", "水", "木", "金", "土", "日"];
  const normalizeDay = (day) => day.replace("曜日", "");
  const groupedVotes = {};
  for (const v of votes) {
    const day = normalizeDay(v.day);
    if (!groupedVotes[day]) groupedVotes[day] = [];
    groupedVotes[day].push(v);
  }
  const adopted = {};
  const overflow = [];

  const usedTitles = new Set();

  for (const [day, list] of Object.entries(groupedVotes)) {
    if (list.length === 1) {
      const chosen = list[0];
      const menuMaster = menuMap.get(chosen.menuId);
      adopted[day] = {
        name: chosen.menuName,
        category: menuMaster?.category ?? "その他",
        day,
        voted: true,
        source: "vote",
        id: uuidv4(),
        ingredients: menuMaster?.ingredients ?? [],
      };
    } else {
      const chosen = list[0];
      const menuMaster = menuMap.get(chosen.menuId);

      adopted[day] = {
        name: chosen.menuName,
        category: menuMaster?.category ?? "その他",
        day,
        voted: true,
        source: "vote",
        id: uuidv4(),
        ingredients: menuMaster?.ingredients ?? [],
      };

      overflow.push(...list.slice(1));
    }
    if (adopted[day]?.name) {
      usedTitles.add(adopted[day].name);
    }
  }


  // --- 重複しないランダム取得関数 ---
  const pickUniqueRandom = (list) => {
    const candidates = list.filter((m) => m && !usedTitles.has(m.name));
    const finalList = candidates.length > 0 ? candidates : list;
    if (finalList.length === 0) return null;
    const picked = finalList[Math.floor(Math.random() * finalList.length)];
    usedTitles.add(picked.name);
    return picked;
  };

  const voteMeat = Object.values(adopted).filter((m) => m.category === "肉").length;
  const voteFish = Object.values(adopted).filter((m) => m.category === "魚").length;
  const voteOther = Object.values(adopted).filter((m) => !["肉", "魚"].includes(m.category)).length;

  const needMeat = Math.max(0, mealDays - voteMeat);
  const needFish = Math.max(0, fishDays - voteFish);
  const needOther = Math.max(0, otherDays - voteOther);

  const randomMenus = [
    ...Array(needMeat).fill().map(() => ({
      ...pickUniqueRandom(meatMenus),
      voted: false,
      id: uuidv4(),
      source: "auto",
    })),
    ...Array(needFish).fill().map(() => ({
      ...pickUniqueRandom(fishMenus),
      voted: false,
      id: uuidv4(),
      source: "auto",
    })),
    ...Array(needOther).fill().map(() => ({
      ...pickUniqueRandom(otherMenus),
      voted: false,
      id: uuidv4(),
      source: "auto",
    })),
  ];

  const filledDays = Object.keys(adopted);
  const emptyDays = days.filter((d) => !filledDays.includes(d));

  let idx = 0;
  for (const menu of overflow) {
    if (idx < emptyDays.length) {
      const menuMaster = menuMap.get(menu.menuId);

      adopted[emptyDays[idx]] = {
        name: menu.menuName,
        category: menuMaster?.category ?? "その他",
        day: emptyDays[idx],
        voted: true,
        source: "overflow",
        id: uuidv4(),
        ingredients: menuMaster?.ingredients ?? [],
      };

      usedTitles.add(menu.menuName);
      idx++;
    }
  }

  let randomIdx = 0;

  for (const day of days) {
    if (!adopted[day] && randomIdx < randomMenus.length) {
      const menu = randomMenus[randomIdx];
      adopted[day] = {
        ...menu,
        day,
        ingredients: menu.ingredients || [],
      };
      usedTitles.add(menu.name);
      randomIdx++;
    }
  }

  const menusRef = collection(menuWeekRef, "menus");

  for (const day of days) {
    const menu = adopted[day];
    if (menu) {
      await setDoc(doc(menusRef, day), {
        ...menu,
        voted: menu.voted ?? false,
        ingredients: menu.ingredients || [],
      });
    }
  }



  return adopted;


}
