import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { useApp } from "./state/AppContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import CategoryModules from "./pages/CategoryModules";
import Developer from "./pages/Developer";
import Contact from "./pages/Contact";
import Settings from "./pages/Settings";

export default function App() {
  const { isDeveloper } = useApp();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/:categoryId" element={<CategoryModules />} />
        <Route
          path="/developer"
          element={isDeveloper ? <Developer /> : <Navigate to="/" replace />}
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
