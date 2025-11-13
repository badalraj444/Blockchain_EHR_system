import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Landing from './Landing';
import Navbar from "./components/Navbar";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navbar><Landing /></Navbar>} />
        {/* <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-registration" element={<UserRegistration />} />
          <Route path="/permissions-management" element={<PermissionsManagement />} />
          <Route path="/data-upload" element={<DataUpload />} />
          <Route path="/data-retrieval" element={<DataRetrieval />} />
        </Route> */}
      </Routes>
    </Router>
  );
}
