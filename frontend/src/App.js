import Register from "./components/Register";
import Login from "./components/Login";
import React from "react";
import { Routes,Route } from "react-router-dom";


function App() {
  return (
    <Routes>
    <Route path="" element={<Register />} />
    <Route path="/login" element={<Login />} />
  </Routes>
  );
}

export default App;
