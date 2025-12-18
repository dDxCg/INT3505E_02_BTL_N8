import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import styles from "./AuthPage.module.css";

type AuthMode = "login" | "signup" | "guest";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const navigate = useNavigate();
  if (mode === "guest") {
    navigate("/order");
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {mode === "login" ? <Login /> : <Signup />}

        <div className={styles.switch}>
          {mode === "login" ? (
            <>
              <button className={styles.link} onClick={() => setMode("signup")}>
                Sign up
              </button>

              <button className={styles.link} onClick={() => setMode("guest")}>
                Continue as guest
              </button>
            </>
          ) : (
            <>
              <button className={styles.link} onClick={() => setMode("login")}>
                Login
              </button>

              <button className={styles.link} onClick={() => setMode("guest")}>
                Continue as guest
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
