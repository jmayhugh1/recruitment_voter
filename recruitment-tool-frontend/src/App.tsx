import { Routes, Route } from "react-router-dom";
import SignInScreen from "./pages/SignInScreen";
import CandidateScreen from "./pages/CandidateScreen";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SignInScreen />} />
      <Route path="/candidates" element={<CandidateScreen />} />
    </Routes>
  );
}
