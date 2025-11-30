import React, { useState } from "react";
import SidebarButton from "./SidebarButton";
import styles from "./Sidebar.module.css";

export interface SidebarItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  component: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  currentKey: string;
  onSelect: (item: SidebarItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, currentKey, onSelect }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.title}>Admin Panel</div>

      <div className={styles.items}>
        {items.map((item) => (
          <SidebarButton
            key={item.key}
            label={item.label}
            icon={item.icon}
            active={currentKey === item.key}
            onClick={() => onSelect(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
