import FeedbackForm from "@/components/Feedback/FeedbackForm";
import styles from "./FeedbackPage.module.css";

export default function FeedbackPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Feedback</h1>
        <FeedbackForm />
      </div>
    </div>
  );
}
