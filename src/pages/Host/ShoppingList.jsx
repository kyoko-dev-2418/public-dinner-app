
import './HostHome.css';
import './ShoppingList.css';
import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { getWeekId } from "../Guest/GetWeekId";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';


const ShoppingList = () => {
  const [checkedItems, setCheckedItems] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hostId } = useParams();



  // Firestore から今週の献立を取得
  const fetchMenus = useCallback(async () => {
    try {
      const weekId = getWeekId(0);
      const menusRef = collection(db, "weeklyPlans", hostId, "week", weekId, "menus");
      const snap = await getDocs(menusRef);

      if (snap.empty) {
        setMenus([]);
      } else {
        const data = snap.docs.map((d) => d.data());
        const order = ["月", "火", "水", "木", "金", "土", "日"];
        data.sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
        setMenus(data);
      }
    } catch (err) {
      console.error("献立データ取得エラー:", err);
    } finally {
      setLoading(false);
    }
  }, [hostId]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);





  const ingredientMap = {};
  menus.forEach((item) => {
    item.ingredients.forEach((ing) => {
      if (!ingredientMap[ing]) {
        ingredientMap[ing] = [];
      }
      ingredientMap[ing].push(`${item.day}:${item.name || item.title || "不明なメニュー"}`)
    });
  });
  const handleShoppingListClick = (ingredient) => {
    setCheckedItems(prev => {
      if (prev.includes(ingredient)) {
        return prev.filter(i => i !== ingredient);
      } else {
        return [...prev, ingredient];
      }
    })
  }

  const ShoppingList_items = Object.entries(ingredientMap).map(([ingredient, uses]) => (

    <li
      key={ingredient}
      className={checkedItems.includes(ingredient) ? "checked" : ""}
    >
      <div className="ShoppingList_item_title">
        <input type="checkbox"
          checked={checkedItems.includes(ingredient)}
          onChange={() => handleShoppingListClick(ingredient)}
        />
        <h3>{ingredient}</h3>
      </div>
      <div className="material_list_material_list">
        <h4>◆使用する曜日</h4>
        {uses.map((u) => (
          <p key={`${ingredient}-${u}`}>{u}</p>
        ))}

      </div>
    </li>
  ));



  return (
    <div className="container">
      <div className="ShoppingList">

        {loading ? (
          <div className="loading-container">
            <p>読み込み中・・・</p>
            <div className="spinner"></div>
          </div>
        ) : ShoppingList_items.length === 0 ? (

            <p>今週の献立データがありません</p>

        ) : (
          <>
            <div className="section_title">
              <img src="/5.png" alt="買い物かご" />
              <h3>買い出しリスト</h3>
            </div>
            <ul className='ShoppingList_items'>
              {ShoppingList_items}
            </ul>
          </>

        )}





      </div>

      <Link to={`/host/${hostId}`} className="shopping_list_button shopping_list_button2">
        <p>トップへ戻る</p>
      </Link>
    </div>
  )
}

export default ShoppingList;