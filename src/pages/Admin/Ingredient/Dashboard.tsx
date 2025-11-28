import React, { useState } from "react";
import UnitPage from "./Unit";
import IngredientPage from "./Ingredient";
import Navbar, { NavbarPage } from "@/components/Admin/Navbar/Navbar";

const navPages: NavbarPage[] = [
  { key: "ingredient", label: "Ingredient", component: <IngredientPage /> },
  { key: "unit", label: "Unit", component: <UnitPage /> },
  {
    key: "analysis",
    label: "Analysis",
    component: <div>Analysis Coming Soon</div>,
    disabled: true,
  },
];

const IngredientDashboard: React.FC = () => {
  const [activePage, setActivePage] = useState(navPages[0]);

  return (
    <div>
      <Navbar
        items={navPages}
        activeKey={activePage.key}
        onSelect={setActivePage}
      />
      <div style={{ padding: "16px" }}>{activePage.component}</div>
    </div>
  );
};

export default IngredientDashboard;
