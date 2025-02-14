import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box, Container, Typography, IconButton, Menu, MenuItem, Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import CalculateIcon from "@mui/icons-material/Calculate";
import HistoryIcon from "@mui/icons-material/History";
import { auth } from "../lib/firebase";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);

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

  const handleAboutOpen = () => {
    setAboutOpen(true);
  };

  const handleAboutClose = () => {
    setAboutOpen(false);
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
            {/* User Info */}
            <Typography variant="body1" sx={{ fontWeight: "bold", marginRight: 2 }}>
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

            {/* Calculator and History Buttons */}
            <Button
              variant="contained"
              startIcon={<CalculateIcon />}
              sx={{ ml: 2 }}
              onClick={() => router.push('/CalculatorPage')}
            >
              Calculator
            </Button>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              sx={{ ml: 2 }}
              onClick={() => router.push('/HistoryPage')}
            >
              History
            </Button>
          </Box>
        )}
      </Box>

      {/* Main DSS Section */}
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
          Welcome to DSS Project MMI
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This project is developed to provide a framework for Decision Support Systems.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Contributors:
        </Typography>
        <Typography variant="body1">
          24/546050/PPA/06833 - Aziz Hendra Atmadja
          <br />
          24/548101/PPA/06919 - Marta Zuriadi
          <br />
          24/548140/PPA/06921 - Silvanus Satno Nugraha
        </Typography>
      </Container>
    </Box>
  );
}