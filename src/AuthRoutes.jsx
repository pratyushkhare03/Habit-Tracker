// src/AuthRoutes.jsx
import { Outlet } from "react-router-dom";
import AuthLayout from "./AuthLayout";
export default function AuthRoutes() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
