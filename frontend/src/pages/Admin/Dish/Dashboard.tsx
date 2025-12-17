import React, { useState } from "react";
import DishPage from "./Dish";
import TagPage from "./Tag";
import Navbar, { NavbarPage } from "@/components/Admin/Navbar/Navbar";

const navPages: NavbarPage[] = [
  { key: "dish", label: "Dish", component: <DishPage /> },
  { key: "tags", label: "Tags", component: <TagPage /> },
  {
    key: "analysis",
    label: "Analysis",
    component: <div>Analysis Coming Soon</div>,
    disabled: true,
  },
];

const DishDashboard: React.FC = () => {
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

export default DishDashboard;
