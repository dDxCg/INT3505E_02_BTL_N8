import React from "react";
import NavbarItem from "./NavbarItem";
import styles from "./Navbar.module.css";

export interface NavbarPage {
  key: string;
  label: string;
  component: React.ReactNode;
  disabled?: boolean;
}

interface NavbarProps {
  items: NavbarPage[];
  activeKey: string;
  onSelect: (item: NavbarPage) => void;
}

const Navbar: React.FC<NavbarProps> = ({ items, activeKey, onSelect }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.items}>
        {items.map((item) => (
          <NavbarItem
            key={item.key}
            label={item.label}
            active={activeKey === item.key}
            disabled={item.disabled}
            onClick={() => onSelect(item)}
          />
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
