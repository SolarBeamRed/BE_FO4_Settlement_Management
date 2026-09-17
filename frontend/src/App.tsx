import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import SettlementDetails from "./pages/SettlementDetails";
import Settlements from "./pages/Settlements";
import MySettlements from "./pages/MySettlements";
import MySettlementDetails from "./pages/MySettlementDetails";
import AppLayout from "./components/layout/AppLayout";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/settlements" element={<Settlements />} />
            <Route
              path="/settlements/:settlementName"
              element={<SettlementDetails />}
            />
            <Route path="/my-settlements" element={<MySettlements />} />
            <Route path="/my-settlements/:settlementId" element={<MySettlementDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
