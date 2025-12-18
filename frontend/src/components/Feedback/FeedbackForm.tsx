import { useState } from "react";
import StarRating from "./StarRating";
import styles from "./FeedbackForm.module.css";
import { toast } from "react-toastify";

export default function FeedbackForm() {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stars) {
      toast.warning("Please select a star rating!");
      return;
    }
    console.log({ stars, comment });
    toast.success("Feedback submitted!");
    setStars(0);
    setComment("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>Rate us:</label>
      <StarRating value={stars} onChange={setStars} />

      <label className={styles.label}>Comment:</label>
      <textarea
        className={styles.textarea}
        aria-label="Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={6}
      />

      <button className={styles.button} type="submit">
        Submit
      </button>
    </form>
  );
}
