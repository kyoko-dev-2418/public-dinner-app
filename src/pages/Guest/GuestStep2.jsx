
import { useEffect, useState } from 'react';
import './GuestStep.css';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';


const GuestStep2 = () => {
  const { category, menu, setMenu, day, setDay, menuList, setMenuList, editingIndex, setEditingIndex } = useOutletContext();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [filteredMenu, setFilteredMenu] = useState([]);


const { hostId } = useParams();


  useEffect(() => {
    const filteredMenu = async () => {


      try {

        const querySnapshot = await getDocs(collection(db, "availableMenus", hostId, "menus"));
        const menus = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter(item => item.category === category);
        setFilteredMenu(menus);
      } catch (error) {
        console.error(error);
        alert("メニュー取得に失敗しました");
      }
    }
    filteredMenu();
  }, [category])

  const toggleGuestStepMenu = (index) => {
    setOpenIndex(openIndex === index ? null : index);
    setMenu(filteredMenu[index]);
  };



  const handleAdd = (item, day) => {
    if (!menu || !day || !menu.name) {
      alert("メニューと曜日を選択してください。")
      return;
    }
    let newMenuList = [...menuList];

    const sameDayIndex = newMenuList.findIndex(m => m.day === day && m.menu.name !== item.name);
    if (sameDayIndex !== -1) {
      const confirmChange = window.confirm(
        `${day}には既に他のメニューが登録されています。上書きしますか？`
      )
      if (!confirmChange) return;
      newMenuList.splice(sameDayIndex, 1);
      newMenuList.push({ menu: item, day });

      setMenuList(newMenuList);
      navigate(`/guest/${hostId}/GuestStep3`);
      return;
    };
    const sameMenuIndex = newMenuList.findIndex(m => m.menu.name === item.name);
    if (sameMenuIndex !== -1 && newMenuList[sameMenuIndex].day !== day) {
      const confirmChange = window.confirm(
        `${item.name}は既に登録されています。上書きしますか？`
      )
      if (!confirmChange) return;
      newMenuList.splice(sameMenuIndex, 1);
      newMenuList.push({ menu: item, day });
      setMenuList(newMenuList);
      navigate(`/guest/${hostId}/GuestStep3`);
      return;
    };


    if (editingIndex !== null && editingIndex < newMenuList.length) {
      newMenuList[editingIndex] = { menu: item, day };
      setEditingIndex(null);
    } else {
      newMenuList.push({ menu: item, day });
    }
    setMenuList(newMenuList);
    navigate(`/guest/${hostId}/GuestStep3`);
  };



  return (

    <div className="GuestStep2">
      <div className="container">
        <div className="Step_inner">
          <img className="GuestStep_stepimg" src="/step2.png" alt="ステップ" />
          <h3>来週食べたい料理に投票しよう！</h3>

          <h4>投票一覧</h4>

          {
            filteredMenu.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={`Gueststep2_button ${openIndex === index ? "open" : ""}`}
                role="button"
                tabIndex={0}
              >
                <div className="Gueststep2_button_box"
                  onClick={() => {
                    toggleGuestStepMenu(index);
                    setMenu(item);
                  }}>
                  <p>{item.name}</p>
                  <img src="/arrow3.png" alt="矢印" />
                </div>
                {openIndex === index && (
                  <div className="Gueststep2_button_hide">
                    <p>何曜日に投票しますか？？</p>
                    <select
                      name="GuestStep2_day_select"
                      defaultValue="default"
                      onChange={e => setDay(e.target.value)}
                    >
                      <option value="default">日付を選択してください</option>
                      <option value="月曜日">月曜日</option>
                      <option value="火曜日">火曜日</option>
                      <option value="水曜日">水曜日</option>
                      <option value="木曜日">木曜日</option>
                      <option value="金曜日">金曜日</option>
                      <option value="土曜日">土曜日</option>
                      <option value="日曜日">日曜日</option>
                    </select>

                    <button className='GuestStepbutton GuestStep2button1' onClick={() => handleAdd(menu, day)}>投票に追加</button>
                  </div>
                )}
              </div>
            ))
          }



          <Link className='Gueststep2button2' to={`/guest/${hostId}`}>＜ カテゴリ選択へ戻る</Link>
        </div>

      </div>
    </div>
  );
}

export default GuestStep2;