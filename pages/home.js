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
        alignItems: "center",
        justifyContent: "center",
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

      {/* Content with Blur Background */}
      <Box
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent dark background
          backdropFilter: "blur(10px)", // Blur effect
          padding: "2rem",
          borderRadius: "8px",
          textAlign: "center",
          color: "white",
          maxWidth: "90%",
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: "bold", color: "#FFD700" }}>
          Welcome to DSS Project MMI
        </Typography>

        <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold", color: "#FFFFFF" }}>
          24/546050/PPA/06833 - Aziz Hendra Atmadja <br />
          24/548101/PPA/06919 - Marta Zuriadi <br />
          24/548140/PPA/06921 - Silvanus Satno Nugraha
        </Typography>
      </Box>
    </Box>
  );
}
