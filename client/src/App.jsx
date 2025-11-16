import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Landing from './Landing';
import Navbar from "./components/Navbar";
import Signup from "./auth/Signup";  // ← import your signup page
import Login from "./auth/Login";
import Patient from "./users/Patient";
import CareProvider from "./users/CareProvider";
import Researcher from "./users/Researcher";
import { Toaster } from "react-hot-toast";
import useAuthUser  from "./hooks/useAuthUser";



export default function App() {
  const { isLoading, authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const role = authUser?.role;
  //todo : add loading state 
  return (
    <div>
      <Routes>

        {/* Landing page */}
        <Route
          path="/"
          element={!isAuthenticated ? (<Navbar><Landing /></Navbar>):(<Navigate to = {`/${role.toLowerCase()}`}/>)}
        />

        {/* Signup page */}
        <Route
          path="/signup"
          element={!isAuthenticated ? (<Navbar><Signup /></Navbar>) : (<Navigate to={`/${role.toLowerCase()}`} />)}
        />
        {/* Login page */}
        <Route
          path="/login"
          element={!isAuthenticated ? (<Navbar><Login /></Navbar>) : (<Navigate to={`/${role.toLowerCase()}`} />)}
        />
        <Route path="/patient" element={isAuthenticated && role === "Patient" ? <Navbar><Patient /></Navbar> : <Navigate to="/login" />} />
        <Route path="/careprovider" element={isAuthenticated && role === "CareProvider" ? <Navbar><CareProvider /></Navbar> : <Navigate to="/login" />} />
        <Route path="/researcher" element={isAuthenticated && role === "Researcher" ? <Navbar><Researcher /></Navbar> : <Navigate to="/login" />} />

      </Routes>
      {/* <Toaster /> */}
    </div>
  );
}
