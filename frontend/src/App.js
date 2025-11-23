import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import MainLayout from "./layouts/MainLayout";

import Register from "./components/Register";
import Login from "./components/Login";
import React from "react";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <MainLayout>
            <Feed />
          </MainLayout>
        }
      />
      <Route
        path="/create"
        element={
          <MainLayout>
            <CreatePost />
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;
