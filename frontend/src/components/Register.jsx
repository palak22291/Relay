import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Card, Typography, Button, Alert, CircularProgress } from "@mui/material";

import axiosInstance from "../utils/axiosInstance";
import { registerSchema, defaultRegisterValues } from "../schemas/registerSchema";
import RHFPasswordField from "../hook-form/RHFPasswordField";
import RHFTextField from "../hook-form/RHFTextField";

export default function Register() {
  const navigate = useNavigate();
  const [serverMessage, setServerMessage] = useState(null);
  const [severity, setSeverity] = useState("info");

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
      setSeverity("error");
      setServerMessage(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Network error. Please try again."
      );
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse?.credential;
      if (!token) throw new Error("No credential token received");

      const res = await axiosInstance.post("/auth/google", { token });
      localStorage.setItem("authToken", res.data.token);
      navigate("/");
    } catch (err) {
      setSeverity("error");
      setServerMessage(err?.response?.data?.error || "Google sign-in failed.");
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
        py: 4,
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
          Join the conversation.
        </Typography>

        <Card sx={{ p: 3 }}>
          {serverMessage && (
            <Alert severity={severity} sx={{ mb: 2 }}>
              {serverMessage}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <RHFTextField name="firstName" placeholder="First name" />
                  <RHFTextField name="lastName" placeholder="Last name" />
                </Box>
                <RHFTextField name="email" placeholder="Email" />
                <RHFPasswordField name="password" placeholder="Password" />
                <RHFPasswordField name="confirmPassword" placeholder="Confirm password" />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? <CircularProgress color="inherit" size={16} /> : null
                  }
                >
                  {isSubmitting ? "Creating…" : "Create account"}
                </Button>

                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      setSeverity("error");
                      setServerMessage("Google sign-in was cancelled or failed.");
                    }}
                    theme="filled_black"
                    shape="pill"
                  />
                </Box>

                <Typography
                  sx={{ textAlign: "center", fontSize: "13px", color: "text.disabled" }}
                >
                  Already have an account?{" "}
                  <Box
                    component="span"
                    sx={{ color: "primary.main", cursor: "pointer" }}
                    onClick={() => navigate("/login")}
                  >
                    Sign in
                  </Box>
                </Typography>
              </Box>
            </form>
          </FormProvider>
        </Card>
      </Box>
    </Box>
  );
}
