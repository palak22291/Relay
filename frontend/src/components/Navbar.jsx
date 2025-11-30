import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "rgba(20, 20, 35, 0.7)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            cursor: "pointer",

            background:
              "linear-gradient(135deg, hsl(270, 70%, 65%), hsl(270, 80%, 75%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          onClick={() => navigate("/")}
        >
          Connectify
        </Typography>

        <Box>
          <Button
            variant="contained"
            onClick={() => navigate("/create")}
            sx={{ textTransform: "none" }}
          >
            Create Post
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
