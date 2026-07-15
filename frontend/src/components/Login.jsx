import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { Box, Card, Button, TextField, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem("authToken", res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });
      localStorage.setItem("authToken", res.data.token);
      navigate("/");
    } catch (err) {
      setError("Google sign-in failed. Try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 400, px: 3 }}>
        {/* Wordmark centered */}
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "28px",
            textAlign: "center",
            mb: 1,
            color: "text.primary",
            letterSpacing: "-0.5px",
            "& span": { color: "primary.main" },
          }}
        >
          Relay<span>.</span>
        </Typography>
        <Typography
          sx={{ textAlign: "center", color: "text.disabled", fontSize: "14px", mb: 4 }}
        >
          Welcome back.
        </Typography>

        <Card sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google sign-in failed. Try again.")}
                  theme="filled_black"
                  shape="pill"
                />
              </Box>

              <Typography sx={{ textAlign: "center", fontSize: "13px", color: "text.disabled" }}>
                Don't have an account?{" "}
                <Box
                  component="span"
                  sx={{ color: "primary.main", cursor: "pointer" }}
                  onClick={() => navigate("/register")}
                >
                  Sign up
                </Box>
              </Typography>
            </Box>
          </form>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;
