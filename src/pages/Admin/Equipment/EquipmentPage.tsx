import React from "react";
import "./EquipmentPage.module.css";

const EquipmentPage: React.FC = () => {
  return (
    <div className="equipment-page">
      <h1>Equipment Management</h1>
      <p>Track and manage all equipment.</p>
      <ul>
        <li>Oven - Status: Active</li>
        <li>Mixer - Status: Maintenance</li>
        <li>Fridge - Status: Active</li>
      </ul>
    </div>
  );
};

export default EquipmentPage;
