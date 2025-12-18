import { useState } from "react";
import styles from "./AuthPage.module.css";

type SignupPayload = {
  name: string;
  email: string;
  contact: string;
  password: string;
};

export default function Signup() {
  const [form, setForm] = useState<SignupPayload>({
    name: "",
    email: "",
    contact: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup payload:", form);
  };

  return (
    <>
      <h2 className={styles.title}>Create account</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="contact"
          placeholder="Phone number"
          value={form.contact}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button className={styles.primary} type="submit">
          Sign up
        </button>
      </form>
    </>
  );
}
