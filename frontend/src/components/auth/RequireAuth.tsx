import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuth, Role } from "@/hooks/useAuth";

type Props = {
  allowedRoles: Role[];
};

const RequireAuth: React.FC<Props> = ({ allowedRoles }) => {
  const location = useLocation();
  const auth = getAuth();

  if (!auth?.token) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to="/staff" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
