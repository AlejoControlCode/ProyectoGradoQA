import { Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import DashboardAdmin from "./DashboardAdmin.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<DashboardAdmin />} />
    </Routes>
  );
}

export default App;
