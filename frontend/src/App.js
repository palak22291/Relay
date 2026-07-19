import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import MainLayout from "./layouts/MainLayout";
import PostDetails from "./pages/PostDetails";

import Register from "./components/Register";
import Login from "./components/Login";
import React, { useState, useMemo, useEffect, createContext, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./theme";
import { SocketProvider } from "./context/SocketContext";
import EditPost from "./pages/EditPost";

// Dark/light toggle — consumed by MainLayout's navbar button
const ColorModeContext = createContext({ mode: "dark", toggleMode: () => {} });
export const useColorMode = () => useContext(ColorModeContext);

// No token → straight to /login. (Expired tokens are handled by the
// axios 401 interceptor, which clears the token and redirects.)
function RequireAuth({ children }) {
  const token = localStorage.getItem("authToken");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem("colorMode") || "dark");
  const theme = useMemo(() => getTheme(mode), [mode]);

  // keep the pre-paint background (index.css html[data-theme]) in sync
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const toggleMode = () =>
    setMode((m) => {
      const next = m === "dark" ? "light" : "dark";
      localStorage.setItem("colorMode", next);
      return next;
    });

  return (
    <ColorModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SocketProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <MainLayout>
                  <Feed />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/create"
            element={
              <RequireAuth>
                <MainLayout>
                  <CreatePost />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/edit/:postId"
            element={
              <RequireAuth>
                <MainLayout>
                  <EditPost />
                </MainLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/post/:postId"
            element={
              <RequireAuth>
                <MainLayout>
                  <PostDetails />
                </MainLayout>
              </RequireAuth>
            }
          />
        </Routes>
        </SocketProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
