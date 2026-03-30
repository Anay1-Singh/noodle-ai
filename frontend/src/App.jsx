import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import NoodleAuth from "./pages/Auth";
import Hub from "./pages/Hub";
import Easy from "./pages/Easy";
import Medium from "./pages/Medium";
import Hard from "./pages/Hard";
import Onboarding from "./pages/Onboarding";
import ProfileEdit from "./pages/ProfileEdit";
import NoodleX from "./pages/NoodleX";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<NoodleAuth />} />
        <Route path="/signup" element={<NoodleAuth />} />
        <Route path="/noodle-x" element={<NoodleX />} />

        {/* Protected Routes — require valid JWT */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/hub" element={<ProtectedRoute><Hub /></ProtectedRoute>} />
        <Route path="/hub/profile" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        <Route path="/hub/easy" element={<ProtectedRoute><Easy /></ProtectedRoute>} />
        <Route path="/hub/medium" element={<ProtectedRoute><Medium /></ProtectedRoute>} />
        <Route path="/hub/hard" element={<ProtectedRoute><Hard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
