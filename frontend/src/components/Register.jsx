// // import React, { useEffect, useState } from "react";

// // import { GoogleLogin } from "@react-oauth/google";
// // import {jwtDecode }from "jwt-decode";

// // import { FormProvider, useForm } from "react-hook-form";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import {
// //   Box,
// //   Card,
// //   CardContent,
// //   Typography,
// //   Stack,
// //   Button,
// //   Alert,
// //   CircularProgress,
// //   Fade,
// // } from "@mui/material";

// // import axiosInstance from "../utils/axiosInstance";
// // import {
// //   registerSchema,
// //   defaultRegisterValues,
// // } from "../schemas/registerSchema";
// // import RHFPasswordField from "../hook-form/RHFPasswordField";
// // import RHFTextField from "../hook-form/RHFTextField";

// // console.log("Current window origin:", window.location.origin);

// // console.log("Google Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);

// // export default function Register() {
// //   const [serverMessage, setServerMessage] = useState(null);
// //   const [severity, setSeverity] = useState("info");

// //   const subtitleTexts = React.useMemo(
// //     () => [
// //       "Connect. Share. Grow.",
// //       "Empowering your digital presence.",
// //       "Join the Connectify community.",
// //       "Redefining online communities.",
// //     ],
// //     []
// //   );

// //   const [currentIndex, setCurrentIndex] = useState(0);
// //   const [fadeIn, setFadeIn] = useState(true);

// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       setFadeIn(false);
// //       setTimeout(() => {
// //         setCurrentIndex((prev) => (prev + 1) % subtitleTexts.length);
// //         setFadeIn(true);
// //       }, 300);
// //     }, 3000);

// //     return () => clearInterval(interval);
// //   }, [subtitleTexts]);

// //   const methods = useForm({
// //     resolver: zodResolver(registerSchema),
// //     defaultValues: defaultRegisterValues,
// //     mode: "onTouched",
// //   });

// //   const {
// //     handleSubmit,
// //     formState: { isSubmitting },
// //     reset,
// //   } = methods;

// //   const onSubmit = async (values) => {
// //     setServerMessage(null);
// //     try {
// //       const payload = {
// //         firstName: values.firstName.trim(),
// //         lastName: values.lastName.trim(),
// //         email: values.email.trim(),
// //         password: values.password,
// //       };

// //       const res = await axiosInstance.post("/auth/register", payload);

// //       if (res.status === 200 || res.status === 201) {
// //         setSeverity("success");
// //         setServerMessage(res.data?.message || "Registration successful!");
// //         reset();
// //       } else {
// //         setSeverity("error");
// //         setServerMessage(res.data?.error || "Registration failed. Try again.");
// //       }
// //     } catch (err) {
// //       console.error("Register error:", err?.response || err);
// //       setSeverity("error");
// //       const serverErr =
// //         err?.response?.data?.error || err?.response?.data?.message;
// //       setServerMessage(serverErr || "Network error. Please try again.");
// //     }
// //   };

// //   const handleGoogleSuccess = async (credentialResponse) => {
// //         console.log("🔹 Google credential response:", credentialResponse);
// //         try {
// //           const token = credentialResponse?.credential;
// //           if (!token) throw new Error("No credential token received from Google");

// //           const decoded = jwtDecode(token);
// //           console.log("🧠 Decoded Google user:", decoded);

// //           const res = await axiosInstance.post("/auth/google", { token });
// //           console.log("✅ Server response from /auth/google:", res.data);

// //           setSeverity("success");
// //           setServerMessage("Google sign-in successful!");
// //         } catch (err) {
// //           console.error("❌ Google login error:", err?.response || err);
// //           setSeverity("error");
// //           setServerMessage(
// //             err?.response?.data?.error ||
// //               err?.response?.data?.message ||
// //               "Google sign-in failed. Try again."
// //           );
// //         }
// //       };

// //       // ✅ ADD THIS BELOW
// //       const handleGoogleError = () => {
// //         console.warn("⚠️ Google sign-in was cancelled or failed.");
// //         setSeverity("error");
// //         setServerMessage("Google sign-in was cancelled or failed.");
// //       };

// //   return (
// //     <Box
// //       sx={{
// //         position: "relative",
// //         minHeight: "100vh",
// //         display: "flex",
// //         alignItems: "center",
// //         justifyContent: "center",
// //         overflow: "hidden",
// //         p: 2,
// //         background: "linear-gradient(135deg, #0d0d16, #1a0033)",
// //         "&::before": {
// //           content: '""',
// //           position: "absolute",
// //           top: "-50%",
// //           left: "-50%",
// //           width: "200%",
// //           height: "200%",
// //           background:
// //             "radial-gradient(circle at 20% 30%, rgba(106,0,244,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(156,39,176,0.1), transparent 50%)",
// //           animation: "moveGradient 10s ease-in-out infinite alternate",
// //           zIndex: 0,
// //         },
// //         "@keyframes moveGradient": {
// //           "0%": { transform: "translate(0, 0)" },
// //           "100%": { transform: "translate(5%, 5%)" },
// //         },
// //       }}
// //     >
// //       <Card
// //         elevation={8}
// //         sx={{
// //           width: "100%",
// //           maxWidth: 520,
// //           borderRadius: 3,
// //           background: "rgba(30, 30, 50, 0.9)",
// //           backdropFilter: "blur(10px)",
// //           zIndex: 1,
// //         }}
// //       >
// //         <CardContent sx={{ px: { xs: 3, sm: 6 }, py: 5 }}>
// //           <Typography
// //             variant="h4"
// //             align="center"
// //             fontWeight={900}
// //             gutterBottom
// //             sx={{
// //               background: "linear-gradient(90deg, #6A00F4, #BB86FC)",
// //               WebkitBackgroundClip: "text",
// //               WebkitTextFillColor: "transparent",
// //               animation: "fadeInText 0.8s ease-in-out",
// //               "@keyframes fadeInText": {
// //                 from: { letterSpacing: "4px", opacity: 0 },
// //                 to: { letterSpacing: "0px", opacity: 1 },
// //               },
// //             }}
// //           >
// //             Welcome to{" "}
// //             <span style={{ fontWeight: 900, fontStyle: "italic" }}>
// //               Connectify
// //             </span>
// //           </Typography>

// //           <Fade in={fadeIn} timeout={600}>
// //             <Typography
// //               variant="body1"
// //               align="center"
// //               sx={{
// //                 color: "#E0E0E0",
// //                 mb: 3,
// //                 fontStyle: "italic",
// //               }}
// //             >
// //               {subtitleTexts[currentIndex]}
// //             </Typography>
// //           </Fade>

// //           {serverMessage && (
// //             <Alert severity={severity} sx={{ mb: 2 }}>
// //               {serverMessage}
// //             </Alert>
// //           )}

// //           <FormProvider {...methods}>
// //             <form noValidate onSubmit={handleSubmit(onSubmit)}>
// //               <Stack spacing={2}>
// //                 <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
// //                   <RHFTextField name="firstName" label="First name" />
// //                   <RHFTextField name="lastName" label="Last name" />
// //                 </Stack>

// //                 <RHFTextField name="email" label="Email address" />
// //                 <RHFPasswordField name="password" label="Password" />
// //                 <RHFPasswordField
// //                   name="confirmPassword"
// //                   label="Confirm password"
// //                 />

// //                 <Button
// //                   type="submit"
// //                   variant="contained"
// //                   size="large"
// //                   sx={{
// //                     mt: 1,
// //                     py: 1.3,
// //                     fontWeight: 700,
// //                     textTransform: "none",
// //                     borderRadius: 2,
// //                     background:
// //                       "linear-gradient(135deg, #6A00F4 0%, #BB86FC 100%)",
// //                     "&:hover": {
// //                       background:
// //                         "linear-gradient(135deg, #7B1FE6 0%, #C792EA 100%)",
// //                     },
// //                   }}
// //                   disabled={isSubmitting}
// //                   startIcon={
// //                     isSubmitting ? (
// //                       <CircularProgress color="inherit" size={18} />
// //                     ) : null
// //                   }
// //                 >
// //                   {isSubmitting ? "Creating..." : "Create Account"}
// //                 </Button>

// //                 <Box sx={{ textAlign: "center", mt: 2 }}>
// //                   <Typography
// //                     variant="body2"
// //                     sx={{ mb: 1, color: "text.secondary" }}
// //                   >
// //                     Or sign up with
// //                   </Typography>
// //                   <GoogleLogin
// //                     onSuccess={handleGoogleSuccess}
// //                     onError={handleGoogleError}
// //                     theme="filled_black"
// //                     shape='pill'
// //                     size="large"
// //                   />
// //                 </Box>

// //                 <Typography
// //                   variant="body2"
// //                   align="center"
// //                   sx={{ color: "text.secondary" }}
// //                 >
// //                   Already have an account?{" "}
// //                   <Box
// //                     component="a"
// //                     href="/login"
// //                     sx={{
// //                       color: "primary.main",
// //                       textDecoration: "none",
// //                       fontWeight: 600,
// //                       "&:hover": { textDecoration: "underline" },
// //                     }}
// //                   >
// //                     Sign in
// //                   </Box>
// //                 </Typography>
// //               </Stack>
// //             </form>
// //           </FormProvider>
// //         </CardContent>
// //       </Card>
// //     </Box>
// //   );
// // }

// import React, { useEffect, useState } from "react";
// import {useNaviagte} from "react-router-dom"
// import { GoogleLogin } from "@react-oauth/google";
// import {jwtDecode} from "jwt-decode";

// import { FormProvider, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Stack,
//   Button,
//   Alert,
//   CircularProgress,
//   Fade,
// } from "@mui/material";

// import axiosInstance from "../utils/axiosInstance";
// import {
//   registerSchema,
//   defaultRegisterValues,
// } from "../schemas/registerSchema";
// import RHFPasswordField from "../hook-form/RHFPasswordField";
// import RHFTextField from "../hook-form/RHFTextField";

// console.log("🌍 Frontend loaded at:", window.location.origin);

// console.log("🔑 Google Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);

// export default function Register() {
//   const [serverMessage, setServerMessage] = useState(null);
//   const [severity, setSeverity] = useState("info");

//   const subtitleTexts = [
//     "Connect. Share. Grow.",
//     "Empowering your digital presence.",
//     "Join the Connectify community.",
//     "Redefining online communities.",
//   ];

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [fadeIn, setFadeIn] = useState(true);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setFadeIn(false);
//       setTimeout(() => {
//         setCurrentIndex((prev) => (prev + 1) % subtitleTexts.length);
//         setFadeIn(true);
//       }, 300);
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [subtitleTexts.length]);

//   const methods = useForm({
//     resolver: zodResolver(registerSchema),
//     defaultValues: defaultRegisterValues,
//     mode: "onTouched",
//   });

//   const {
//     handleSubmit,
//     formState: { isSubmitting },
//     reset,
//   } = methods;

//   const onSubmit = async (values) => {
//     setServerMessage(null);
//     try {
//       const payload = {
//         firstName: values.firstName.trim(),
//         lastName: values.lastName.trim(),
//         email: values.email.trim(),
//         password: values.password,
//       };

//       console.log("🧾 Sending registration data:", payload);

//       const res = await axiosInstance.post("/auth/register", payload);

//       console.log("✅ Register response:", res.data);

//       if (res.status === 200 || res.status === 201) {
//         setSeverity("success");
//         setServerMessage(res.data?.message || "Registration successful!");
//         reset();
//       } else {
//         setSeverity("error");
//         setServerMessage(res.data?.error || "Registration failed. Try again.");
//       }
//     } catch (err) {
//       console.error("❌ Register error:", err?.response || err);
//       setSeverity("error");
//       setServerMessage(
//         err?.response?.data?.error ||
//           err?.response?.data?.message ||
//           "Network error. Please try again."
//       );
//     }
//   };

//   const handleGoogleSuccess = async (credentialResponse) => {
//     console.log("🔹 Google credential response:", credentialResponse);
//     try {
//       const token = credentialResponse?.credential;
//       if (!token) throw new Error("No credential token received from Google");

//       const decoded = jwtDecode(token);
//       console.log("🧠 Decoded Google user:", decoded);

//       const res = await axiosInstance.post("/auth/google", { token });
//       console.log("✅ Server response from /auth/google:", res.data);

//       setSeverity("success");
//       setServerMessage("Google sign-in successful!");
//     } catch (err) {
//       console.error("❌ Google login error:", err?.response || err);
//       setSeverity("error");
//       setServerMessage(
//         err?.response?.data?.error ||
//           err?.response?.data?.message ||
//           "Google sign-in failed. Try again."
//       );
//     }
//   };

//   const handleGoogleError = () => {
//     console.warn("⚠️ Google sign-in was cancelled or failed.");
//     setSeverity("error");
//     setServerMessage("Google sign-in was cancelled or failed.");
//   };

//   return (
//     <Box
//       sx={{
//         position: "relative",
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         overflow: "hidden",
//         p: 2,
//         background: "linear-gradient(135deg, #0d0d16, #1a0033)",
//       }}
//     >
//       <Card
//         elevation={8}
//         sx={{
//           width: "100%",
//           maxWidth: 520,
//           borderRadius: 3,
//           background: "rgba(30, 30, 50, 0.9)",
//           backdropFilter: "blur(10px)",
//           zIndex: 1,
//         }}
//       >
//         <CardContent sx={{ px: { xs: 3, sm: 6 }, py: 5 }}>
//           <Typography
//             variant="h4"
//             align="center"
//             fontWeight={900}
//             gutterBottom
//             sx={{
//               background: "linear-gradient(90deg, #6A00F4, #BB86FC)",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//             }}
//           >
//             Welcome to <i>Connectify</i>
//           </Typography>

//           <Fade in={fadeIn} timeout={600}>
//             <Typography
//               variant="body1"
//               align="center"
//               sx={{ color: "#E0E0E0", mb: 3, fontStyle: "italic" }}
//             >
//               {subtitleTexts[currentIndex]}
//             </Typography>
//           </Fade>

//           {serverMessage && (
//             <Alert severity={severity} sx={{ mb: 2 }}>
//               {serverMessage}
//             </Alert>
//           )}

//           <FormProvider {...methods}>
//             <form noValidate onSubmit={handleSubmit(onSubmit)}>
//               <Stack spacing={2}>
//                 <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
//                   <RHFTextField name="firstName" label="First name" />
//                   <RHFTextField name="lastName" label="Last name" />
//                 </Stack>

//                 <RHFTextField name="email" label="Email address" />
//                 <RHFPasswordField name="password" label="Password" />
//                 <RHFPasswordField
//                   name="confirmPassword"
//                   label="Confirm password"
//                 />

//                 <Button
//                   type="submit"
//                   variant="contained"

//                     sx={{
//                       textTransform: "none", // 👈 disables automatic uppercase
//                     }}

//                   disabled={isSubmitting}
//                   startIcon={
//                     isSubmitting ? (
//                       <CircularProgress color="inherit" size={18} />
//                     ) : null
//                   }
//                 >
//                   {isSubmitting ? "Creating..." : "Create Account"}
//                 </Button>

//                 <Box sx={{ textAlign: "center", mt: 2 }}>
//                   <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
//                     Or sign up with
//                   </Typography>

//                   <GoogleLogin
//                     onSuccess={handleGoogleSuccess}
//                     onError={handleGoogleError}
//                     theme="filled_black"
//                     shape="pill"
//                     size="large"
//                   />
//                 </Box>

//                 <Typography
//                   variant="body2"
//                   align="center"
//                   sx={{ color: "text.secondary" }}
//                 >
//                   Already have an account?{" "}
//                   <Box
//                     component="a"
//                     href="/login"
//                     sx={{
//                       color: "primary.main",
//                       textDecoration: "none",
//                       fontWeight: 600,
//                     }}
//                   >
//                     Sign in
//                   </Box>
//                 </Typography>
//               </Stack>
//             </form>
//           </FormProvider>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

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
  const navigate = useNavigate(); // 🔹 Added navigate hook
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

        // 🔹 After successful registration → redirect to login
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse?.credential;
      if (!token) throw new Error("No credential token received from Google");

      const decoded = jwtDecode(token);
      const res = await axiosInstance.post("/auth/google", { token });

      setSeverity("success");
      setServerMessage("Google sign-in successful!");
      // 🔹 Optional: Redirect to dashboard or login after Google sign-in
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("❌ Google login error:", err?.response || err);
      setSeverity("error");
      setServerMessage(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Google sign-in failed. Try again."
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
