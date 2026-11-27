
import {  useState } from "react";
import { Outlet, Link } from "react-router-dom";
import '../pages/Host/HostHome.css';
import './Layout.css';

import Header_Guest from "./Header_Guest";






const LayoutGuest = () => {
  const [category, setCategory] = useState("");
  const [menu, setMenu] = useState(null);
  const [day, setDay] = useState("");
  const [menuList, setMenuList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);


  return (
      <div className="guesthome">
        <Header_Guest />
        <main>
          <Outlet
            context={
              {
                category, setCategory,
                menu, setMenu,
                day, setDay,
                menuList, setMenuList,
                editingIndex, setEditingIndex,
                
              }
            }
          />
        </main>
        <footer>
          <p>© 2025.my-dinner-app</p>
        </footer>
      </div>
  );
};

export default LayoutGuest;