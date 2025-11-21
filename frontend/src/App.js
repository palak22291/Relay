import Feed from "./pages/feed";
import Register from "./components/Register";
import Login from "./components/Login";
import React from "react";
import { Routes,Route } from "react-router-dom";


function App() {
  return (
    <Routes>
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Feed/>}/>
  </Routes>
  );
}

export default App;

