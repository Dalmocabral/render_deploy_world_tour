import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import Home from './pages/Home';
import MyAwards from './pages/MyAwards';
import MyFlights from './pages/MyFlights';
import Awards from './pages/Awards';
import Map from './pages/Map';
import Members from './pages/Members';
import PirepsFlights from './pages/PirepsFlights';
import Navbar from './components/Navbar';
import ProtectedRoutes from './components/ProtectedRoutes';
import EditPirep from './pages/EditPirep';
import Briefing from './pages/briefing';
import AwardDetail from './pages/AwardDetail';
import UserDetail from './pages/UserDetail';
import ProfileEdit from './pages/ProfileEdit';
import PassworldResetRequest from './pages/PassworldResetRequest';
import PasswordResetConfirm from './pages/PassworldResetConfirm';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/request/passworld_reset" element={<PassworldResetRequest />} />
      <Route path="/password_reset" element={<PasswordResetConfirm />} />
      <Route path="/app" element={<Navbar />}>
      
        <Route element={<ProtectedRoutes />}>
          {/* Rotas protegidas */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="awards" element={<Awards />} />
          <Route path="my-flights" element={<MyFlights />} />
          <Route path="my-awards" element={<MyAwards />} />
          <Route path="map" element={<Map />} />
          <Route path="members" element={<Members />} /> {/* <-- Nova rota */}
          <Route path="pirepsflights" element={<PirepsFlights />} /> {/* <-- Nova rota */}
          <Route path="edit-pirep/:id" element={<EditPirep />} />
          <Route path="briefing/:id" element={<Briefing />} />
          <Route path="awards/awardDetail/:id" element={<AwardDetail />} />
          <Route path="userdetail/:id" element={<UserDetail />} />
          <Route path="profile/edit" element={<ProfileEdit />} />    
          
        </Route>
      </Route>
    </Routes>
  );
}
export default App;