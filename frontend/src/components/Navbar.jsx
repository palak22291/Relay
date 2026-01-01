// import React from "react";
// import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// export default function Navbar() {
//   const navigate = useNavigate();

//   const token = localStorage.getItem("authToken");

//   const handleLogout = () => {
//     localStorage.removeItem("authToken");
//     navigate("/login");
//   };

//   return (
//     <AppBar
//       position="sticky"
//       sx={{
//         background: "rgba(20, 20, 35, 0.7)",
//         backdropFilter: "blur(8px)",
//         borderBottom: "1px solid rgba(255,255,255,0.06)",
//       }}
//     >
//       <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
//         <Typography
//           variant="h5"
//           sx={{
//             fontWeight: 800,
//             cursor: "pointer",
//             background:
//               "linear-gradient(135deg, hsl(270, 70%, 65%), hsl(270, 80%, 75%))",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//             backgroundClip: "text",
//           }}
//           onClick={() => navigate("/")}
//         >
//           Connectify
//         </Typography>


//         <Box sx={{ display: "flex", gap: 2 }}>

//        {/* we will show create post button only when user is logged in  */}
//           {token && (
//             <Button
//               variant="contained"
//               onClick={() => navigate("/create")}
//               sx={{ textTransform: "none" }}
//             >
//               Create Post
//             </Button>
//           )}

//           {/* IF USER NOT LOGGED IN → show Login & Signup */}
//           {!token && (
//             <>
//               <Button
//                 variant="outlined"
//                 onClick={() => navigate("/login")}
//                 sx={{ textTransform: "none", color: "white", borderColor: "white" }}
//               >
//                 Login
//               </Button>

//               <Button
//                 variant="contained"
//                 onClick={() => navigate("/register")}
//                 sx={{ textTransform: "none" }}
//               >
//                 Sign Up
//               </Button>
//             </>
//           )}

//           {/* IF USER LOGGED IN → Show Logout */}
//           {token && (
//             <Button
//               variant="outlined"
//               onClick={handleLogout}
//               sx={{ textTransform: "none", color: "white", borderColor: "white" }}
//             >
//               Logout
//             </Button>
//           )}
//         </Box>
//       </Toolbar>
//     </AppBar>
//   );
// }


import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      sx={{
        background:
          "linear-gradient(180deg, rgba(18,18,30,0.95), rgba(10,10,20,0.9))",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
      }}
    >
      <Toolbar
        sx={{
          maxWidth: "1100px",
          width: "100%",
          mx: "auto",
          display: "flex",
          justifyContent: "space-between",
          py: 1.5,
        }}
      >
        {/* BRAND */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            letterSpacing: "0.04em",
            cursor: "pointer",
            background:
              "linear-gradient(135deg, #6A00F4, #BB86FC)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transition: "0.25s",
            "&:hover": {
              transform: "scale(1.03)",
              filter: "brightness(1.15)",
            },
          }}
          onClick={() => navigate("/")}
        >
          Connectify
        </Typography>

        {/* ACTIONS */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/")}
            sx={{
              color: "#BB86FC",
              borderColor: "rgba(187,134,252,0.5)",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
              "&:hover": {
                borderColor: "#BB86FC",
                background: "rgba(187,134,252,0.12)",
              },
            }}
          >
            Feed
          </Button>

          <Button
            variant="contained"
            onClick={() => navigate("/create")}
            sx={{
              background:
                "linear-gradient(135deg, #6A00F4, #BB86FC)",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              borderRadius: 2,
              boxShadow: "0 6px 20px rgba(120,80,255,0.6)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #7B1FFF, #C49BFF)",
                boxShadow: "0 8px 28px rgba(150,110,255,0.8)",
              },
            }}
          >
            Create Post
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
