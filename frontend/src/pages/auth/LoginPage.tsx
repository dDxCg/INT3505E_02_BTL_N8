import { useLocation, useNavigate } from "react-router-dom";
import { setAuth } from "@/hooks/useAuth";
import { ui } from "@/styles/tokens";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || "/staff";

  const loginAs = (role: "staff" | "admin") => {
    // DEV: set thẳng localStorage để test guard/role
    setAuth({
      token: "dev-token",
      role,
      name: role === "admin" ? "TEST ADMIN" : "TEST STAFF",
    });
    navigate(from, { replace: true });
  };

  return (
    <div className={`min-h-screen ${ui.bg} flex items-center justify-center px-4`}>
      <div className={`${ui.card} ${ui.border} w-full max-w-md p-6`}>
        <h1 className={`${ui.text} text-2xl font-bold`}>Đăng nhập</h1>
        <p className={`${ui.muted} mt-2`}>
          (DEV) Chọn role để test phân quyền trước.
        </p>

        <div className="mt-5 space-y-3">
          <button
            onClick={() => loginAs("staff")}
            className={`w-full rounded-lg px-4 py-3 font-semibold ${ui.text} bg-white/10 hover:bg-white/15`}
          >
            Login as Staff
          </button>

          <button
            onClick={() => loginAs("admin")}
            className={`w-full rounded-lg px-4 py-3 font-semibold ${ui.accent} hover:opacity-90`}
          >
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
}
