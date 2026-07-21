// src/context/CurrentUserContext.jsx
// Single source of truth for "who am I". Previously MainLayout, Feed and
// PostDetails each fetched /auth/me independently — three requests per page
// view, and they could disagree if the token changed between fetches (the
// stale "navbar shows A, composer shows bob" bug).
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const CurrentUserContext = createContext({ currentUser: null, loading: true, refresh: () => {} });

export function CurrentUserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // localStorage writes don't fire events in the same tab, but login/logout
  // always navigate — so re-read the token on every route change
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  useEffect(() => {
    setToken(localStorage.getItem("authToken"));
  }, [location]);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("authToken")) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get("/auth/me");
      setCurrentUser(res.data.user);
    } catch {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // refetch whenever the token changes — keeps identity correct after a
  // login/logout in this tab OR a token swap from another tab
  useEffect(() => {
    setLoading(true);
    refresh();
  }, [token, refresh]);

  return (
    <CurrentUserContext.Provider value={{ currentUser, loading, refresh }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export const useCurrentUser = () => useContext(CurrentUserContext);
