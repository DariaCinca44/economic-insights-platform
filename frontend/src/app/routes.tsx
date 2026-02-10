import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Forecast from "../pages/Forecast";
import Compare from "../pages/Compare";
import Export from "../pages/Export";
import Settings from "../pages/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/forecast" element={<Forecast />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/export" element={<Export />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}