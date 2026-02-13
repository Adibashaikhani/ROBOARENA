import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "./components/Shell";
import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import Leaderboard from "./pages/Leaderboard";
import Referee from "./pages/Referee";
import Upcoming from "./pages/Upcoming";
import Stopwatch from "./pages/Stopwatch";
import Venue from "./pages/Venue";
import Admin from "./pages/Admin";
import WinnerHistory from "./pages/WinnerHistory";



export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/referee" element={<Referee />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/venue" element={<Venue />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/winners" element={<WinnerHistory />} />

        


        {/* optional: venue page later */}
        {/* <Route path="/venue" element={<Venue />} /> */}
        <Route path="/stopwatch" element={<Stopwatch />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        

      </Routes>
    </Shell>
  );
}
