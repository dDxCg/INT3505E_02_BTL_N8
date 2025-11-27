import React, { useState } from "react";
import Sidebar, { SidebarItem } from "@/components/Admin/Sidebar/Sidebar";
import styles from "./Admin.module.css";
import EquipmentDashboard from "./Equipment/Dashboard";
import IngredientDashboard from "./Ingredient/Dashboard";

const AdminPage: React.FC = () => {
  const items: SidebarItem[] = [
    { key: "equipment", label: "Equipment", component: <EquipmentDashboard /> },
    {
      key: "ingredient",
      label: "Ingredient",
      component: <IngredientDashboard />,
    },
    // add more sections here later
  ];

  const [currentKey, setCurrentKey] = useState(items[0].key);
  const activeItem = items.find((item) => item.key === currentKey) || items[0];

  return (
    <div className={styles.adminContainer}>
      <Sidebar
        items={items}
        currentKey={currentKey}
        onSelect={(item) => setCurrentKey(item.key)}
      />
      <div className={styles.adminMain}>{activeItem.component}</div>
    </div>
  );
};

export default AdminPage;
