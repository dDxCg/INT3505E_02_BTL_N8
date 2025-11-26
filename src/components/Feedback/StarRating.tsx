import { useState } from "react";
import styles from "./StarRating.module.css";

interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
}

export default function StarRating({
  value = 0,
  onChange,
  max = 5,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className={styles.starWrapper}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <span
          key={star}
          className={`${styles.star} ${
            star <= (hover || value) ? styles.active : styles.inactive
          }`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
