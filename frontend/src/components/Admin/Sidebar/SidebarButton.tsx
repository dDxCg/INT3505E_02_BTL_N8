import React from "react";
import styles from "./SidebarButton.module.css";

interface SidebarButtonProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  label,
  active,
  onClick,
  icon,
}) => {
  return (
    <button
      className={`${styles.button} ${active ? styles.active : ""}`}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
};

export default SidebarButton;
