import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import { Box, Container, Typography, IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/"); // Redirect to login if not authenticated
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = () => {
    auth.signOut();
    router.push("/");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/dss-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* User Profile & Logout Button (Top Right) */}
      <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center" }}>
        {user && (
          <>
            <IconButton onClick={handleMenuOpen} sx={{ display: "flex", alignItems: "center" }}>
              <Avatar src={user.photoURL} sx={{ width: 40, height: 40, mr: 1 }} />
              <Typography variant="body1" sx={{ color: "white", fontWeight: "bold" }}>
                {user.displayName}
              </Typography>
            </IconButton>

            {/* Dropdown Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem disabled>{user.email}</MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* Sticky Header with Text Aligned to User Info */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(10px)",
          padding: "1.5rem",
          borderRadius: "8px",
          textAlign: "right", // Align with user profile
          color: "white",
          maxWidth: "90%",
          margin: "auto",
          mt: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#FFD700", fontSize: "1.8rem" }}>
          Welcome to DSS Project MMI
        </Typography>

        <Typography variant="h6" sx={{ fontSize: "1.2rem", fontWeight: "bold", color: "#FFFFFF" }}>
          24/546050/PPA/06833 - Aziz Hendra Atmadja <br />
          24/548101/PPA/06919 - Marta Zuriadi <br />
          24/548140/PPA/06921 - Silvanus Satno Nugraha
        </Typography>
      </Box>

      {/* Placeholder for More Content Below */}
      <Container sx={{ mt: 8, textAlign: "center", color: "white" }}>
        <Typography variant="h5">More content will be added here...</Typography>
      </Container>
    </Box>
  );
}
