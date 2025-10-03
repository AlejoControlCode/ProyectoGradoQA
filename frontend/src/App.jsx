import { Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import DashboardAdmin from "./DashboardAdmin.jsx";
import DashboardAgenteQA from "./DashboardAgenteQA.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
      <Route path="/DashboardAgenteQA" element={<DashboardAgenteQA />} />
    </Routes>
  );
}

export default App;
