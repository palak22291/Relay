import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import {jwtDecode }from "jwt-decode";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    console.log("🌍 Frontend loaded at:", window.location.origin);
  }, []);

  // 🔹 Handle normal email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://social-media-qec5.onrender.com/auth/login",
        { email, password }
      );
      console.log("✅ Login success:", res.data);
      localStorage.setItem("token", res.data.token);
      navigate("/home"); // redirect after login
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err);
      alert("Invalid credentials!");
    }
  };

  // 🔹 Handle Google login
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("🔹 Google credential response:", credentialResponse);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("🧠 Decoded Google user:", decoded);

      const res = await axios.post(
        "https://social-media-qec5.onrender.com/auth/google",
        {
          token: credentialResponse.credential,
        }
      );

      console.log("✅ Server response from /auth/google:", res.data);
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (error) {
      console.error("❌ Google login error:", error);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("❌ Google login failed:", error);
  };

  return (
    <Box
      sx={{
        width: 400,
        margin: "auto",
        marginTop: 10,
        padding: 3,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Login
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Password"
          margin="normal"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2, borderRadius: "20px" }}
        >
          Login
        </Button>
      </form>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          or continue with
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2">
          Don’t have an account?{" "}
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("")}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
