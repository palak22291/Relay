

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { GoogleLogin } from "@react-oauth/google";
// import { jwtDecode } from "jwt-decode";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Fade,
} from "@mui/material";

import axiosInstance from "../utils/axiosInstance";
import {
  registerSchema,
  defaultRegisterValues,
} from "../schemas/registerSchema";
import RHFPasswordField from "../hook-form/RHFPasswordField";
import RHFTextField from "../hook-form/RHFTextField";

export default function Register() {
  const navigate = useNavigate(); 
  const [serverMessage, setServerMessage] = useState(null);
  const [severity, setSeverity] = useState("info");

  const subtitleTexts = [
    "Connect. Share. Grow.",
    "Empowering your digital presence.",
    "Join the Connectify community.",
    "Redefining online communities.",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % subtitleTexts.length);
        setFadeIn(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [subtitleTexts.length]);

  const methods = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: defaultRegisterValues,
    mode: "onTouched",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (values) => {
    setServerMessage(null);
    try {
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      };

      const res = await axiosInstance.post("/auth/register", payload);

      if (res.status === 200 || res.status === 201) {
        setSeverity("success");
        setServerMessage(res.data?.message || "Registration successful!");
        reset();

  
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setSeverity("error");
        setServerMessage(res.data?.error || "Registration failed. Try again.");
      }
    } catch (err) {
      console.error("❌ Register error:", err?.response || err);
      setSeverity("error");
      setServerMessage(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Network error. Please try again."
      );
    }
  };

  // const handleGoogleSuccess = async (credentialResponse) => {
  //   try {
  //     const token = credentialResponse?.credential;
  //     if (!token) throw new Error("No credential token received from Google");

  //     // const decoded = jwtDecode(token);
  //     // const res = await axiosInstance.post("/auth/google", { token });

  //     setSeverity("success");
  //     setServerMessage("Google sign-in successful!");
    
  //     setTimeout(() => navigate("/login"), 1500);
  //   } catch (err) {
  //     console.error("❌ Google login error:", err?.response || err);
  //     setSeverity("error");
  //     setServerMessage(
  //       err?.response?.data?.error ||
  //         err?.response?.data?.message ||
  //         "Google sign-in failed. Try again."
  //     );
  //   }
  // };
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse?.credential;
      if (!token) throw new Error("No credential token received");
  
      const res = await axiosInstance.post("/auth/google", { token });
  
      localStorage.setItem("authToken", res.data.token);
  
      setSeverity("success");
      setServerMessage("Google sign-in successful!");
  
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("❌ Google login error:", err?.response || err);
      setSeverity("error");
      setServerMessage(
        err?.response?.data?.error ||
        "Google sign-in failed."
      );
    }
  };
  
  
  const handleGoogleError = () => {
    setSeverity("error");
    setServerMessage("Google sign-in was cancelled or failed.");
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        p: 2,
        background: "linear-gradient(135deg, #0d0d16, #1a0033)",
      }}
    >
      <Card
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 3,
          background: "rgba(30, 30, 50, 0.9)",
          backdropFilter: "blur(10px)",
          zIndex: 1,
        }}
      >
        <CardContent sx={{ px: { xs: 3, sm: 6 }, py: 5 }}>
          <Typography
            variant="h4"
            align="center"
            fontWeight={900}
            gutterBottom
            sx={{
              background: "linear-gradient(90deg, #6A00F4, #BB86FC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome to <i>Connectify</i>
          </Typography>

          <Fade in={fadeIn} timeout={600}>
            <Typography
              variant="body1"
              align="center"
              sx={{ color: "#E0E0E0", mb: 3, fontStyle: "italic" }}
            >
              {subtitleTexts[currentIndex]}
            </Typography>
          </Fade>

          {serverMessage && (
            <Alert severity={severity} sx={{ mb: 2 }}>
              {serverMessage}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <RHFTextField name="firstName" label="First name" />
                  <RHFTextField name="lastName" label="Last name" />
                </Stack>

                <RHFTextField name="email" label="Email address" />
                <RHFPasswordField name="password" label="Password" />
                <RHFPasswordField
                  name="confirmPassword"
                  label="Confirm password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  sx={{ textTransform: "none" }}
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : null
                  }
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, color: "text.secondary" }}
                  >
                    Or sign up with
                  </Typography>

                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                  />
                </Box>

                {/* clickable sign in will redirect to login */}
                <Typography
                  variant="body2"
                  align="center"
                  sx={{ color: "text.secondary" }}
                >
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{
                      color: "primary.main",
                      textDecoration: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {/* component="span"
                    onClick={() => navigate("/login")} 
                    sx={{
                      color: "primary.main",
                      textDecoration: "none",
                      fontWeight: 600,
                      cursor: "pointer", 
                    }} */}
                    {/* > */}
                    Sign in
                  </Link>
                </Typography>
              </Stack>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
}
