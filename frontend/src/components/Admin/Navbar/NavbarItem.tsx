import React from "react";
import styles from "./NavbarItem.module.css";

interface NavbarItemProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const NavbarItem: React.FC<NavbarItemProps> = ({ label, active, disabled, onClick }) => {
  return (
    <button
      className={`${styles.button} ${active ? styles.active : ""} ${disabled ? styles.disabled : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default NavbarItem;
