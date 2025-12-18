import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AuthPage.module.css";
import { auth } from "@/services/auth"; // adjust path

type LoginPayload = {
  contact_info: string;
  password: string;
};

export default function Login() {
  const [form, setForm] = useState<LoginPayload>({
    contact_info: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();

      // backend gives JWT
      auth.login(data.access_token);

      const role = auth.role();

      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "staff":
          navigate("/staff");
          break;
        default:
          navigate("/order");
      }
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className={styles.title}>Welcome back</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          name="contact_info"
          placeholder="Phone number"
          value={form.contact_info}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          required
        />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.primary} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </>
  );
}
