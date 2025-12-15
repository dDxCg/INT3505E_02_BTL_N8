import React, { useState } from "react";
import EquipmentStatusPage from "./EquipmentStatus";
import EquipmentTypePage from "./EquipmentType";
import EquipmentPage from "./Equipment";
import TableStatusPage from "./TableStatus";
import TablePage from "./Table";
import Navbar, { NavbarPage } from "@/components/Admin/Navbar/Navbar";

const navPages: NavbarPage[] = [
  { key: "equipment", label: "Equipment", component: <EquipmentPage /> },
  { key: "status", label: "Status", component: <EquipmentStatusPage /> },
  { key: "types", label: "Types", component: <EquipmentTypePage /> },
  {
    key: "table",
    label: "Tables",
    component: <TablePage />,
  },
  {
    key: "table-status",
    label: "Table Status",
    component: <TableStatusPage />,
  },
  {
    key: "analysis",
    label: "Analysis",
    component: <div>Analysis Coming Soon</div>,
    disabled: true,
  },
];

const EquipmentDashboard: React.FC = () => {
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

export default EquipmentDashboard;
