import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box, Container, Typography, IconButton, Menu, MenuItem, Avatar, Button
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import CalculateIcon from "@mui/icons-material/Calculate";
import HistoryIcon from "@mui/icons-material/History";
import { auth } from "../lib/firebase";

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  //

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/");
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
        paddingTop: "0px",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: "white",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "10px 20px",
        }}
      >
        {user && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Calculator Button */}
            <Button
              variant="text"
              startIcon={<CalculateIcon sx={{ color: "gray" }} />}
              sx={{ color: "white", textTransform: "none", fontWeight: "bold", fontSize: "1rem", marginRight: 2 }}
              onClick={() => router.push('/calculatorPage')}
            >
              Calculator
            </Button>

            {/* History Button */}
            <Button
              variant="text"
              startIcon={<HistoryIcon sx={{ color: "gray" }} />}
              sx={{ color: "white", textTransform: "none", fontWeight: "bold", fontSize: "1rem", marginRight: 2 }}
              onClick={() => router.push('/historyPage')}
            >
              History
            </Button>

            {/* User Info */}
            <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: "1rem", marginRight: 2 }}>
              {user.displayName}
            </Typography>
            <IconButton onClick={handleMenuOpen}>
              <Avatar src={user.photoURL} sx={{ width: 40, height: 40 }} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem disabled>{user.email}</MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Box>

      {/* Main History Section */}
      <Container
        sx={{
          backgroundColor: "white",
          width: "70%",
          padding: "2rem",
          borderRadius: "10px",
          mt: 4,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          History Page
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This page will display the history of calculations.
        </Typography>
      </Container>
    </Box>
  );
}