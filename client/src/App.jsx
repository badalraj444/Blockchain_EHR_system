import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Landing from './Landing';
import Navbar from "./components/Navbar";
import Signup from "./auth/Signup";  // ← import your signup page
import Login from "./auth/Login";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Landing page */}
        <Route 
          path="/" 
          element={<Navbar><Landing /></Navbar>} 
        />

        {/* Signup page */}
        <Route 
          path="/signup" 
          element={<Navbar><Signup /></Navbar>} 
        />
        {/* Login page */}
        <Route 
          path="/login" 
          element={<Navbar><Login /></Navbar>} 
        />

      </Routes>
    </Router>
  );
}
