import React from "react";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar"; 

export default function MainLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0d0d16, #1a0028)",
      }}
    >
      {/* Top Navigation */}
      <Navbar />

      {/* Content Container - keeps Feed centered & max width */}
      <Box
        sx={{
          maxWidth: 750,
          mx: "auto",
          px: 2,
          py: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
