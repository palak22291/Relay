import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Registration successful! You can now log in.");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setMessage(data.error || "Registration failed");
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      <Box
        sx={{
          background: "white",
          borderRadius: 3,
          boxShadow: 4,
          p: 5,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <Typography variant="h4" fontWeight={600} textAlign="center" mb={1}>
          Create Account
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          mb={3}
        >
          Sign up to get started
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography
              variant='body1'
              textAlign='center'
              color="textPrimary"
            

              >
                First Name
                </Typography>
              <TextField
                fullWidth
                label=" Enter your first name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
            </Grid>
          </Grid>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{
              mt: 3,
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: 600,
              py: 1.4,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "16px",
              "&:hover": {
                boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
                transform: "translateY(-2px)",
              },
            }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
          </Button>

          {message && (
            <Alert
              sx={{ mt: 2 }}
              severity={message.includes("successful") ? "success" : "error"}
            >
              {message}
            </Alert>
          )}
        </Box>

        <Box
          mt={3}
          pt={2}
          borderTop="1px solid #e1e5e9"
          textAlign="center"
        >
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Typography
              component="a"
              href="/login"
              sx={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sign in
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Register;
