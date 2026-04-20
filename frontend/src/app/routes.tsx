import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Forecast from "../pages/Forecast";
import Compare from "../pages/Compare";
import Settings from "../pages/Settings";
import Explore from "../pages/Explore";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/forecast" element={<Forecast />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/explore" element={<Explore />} />
    </Routes>
  );
}