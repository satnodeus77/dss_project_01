import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box, Container, Typography, IconButton, ListItem, ListItemText, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LogoutIcon from "@mui/icons-material/Logout";
import { auth } from "../lib/firebase";

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [savedResults, setSavedResults] = useState([]);

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

  useEffect(() => {
    if (user) {
      const fetchSavedResults = async () => {
        try {
          const response = await fetch(`/api/getResults?userId=${user.uid}`);
          const data = await response.json();
          setSavedResults(data.results);
        } catch (error) {
          console.error('Error fetching saved results:', error);
        }
      };

      fetchSavedResults();
    }
  }, [user]);

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

  const deleteResult = async (resultId) => {
    try {
      await fetch(`/api/deleteResult?id=${resultId}`, { method: 'DELETE' });
      setSavedResults(savedResults.filter(result => result.id !== resultId));
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  };

  const viewResult = (resultId) => {
    // Implement view result functionality
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
          <>
            {/* About Button */}
            <Typography
              variant="body1"
              onClick={handleAboutOpen}
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                marginRight: 2,
                cursor: "pointer",
              }}
            >
              About
            </Typography>

            {/* User Info */}
            <Typography variant="body1" sx={{ fontWeight: "bold", marginRight: 2 }}>
              {user.displayName}
            </Typography>

            {/* User Avatar */}
            <IconButton onClick={handleMenuOpen}>
              <Avatar src={user.photoURL} sx={{ width: 40, height: 40 }} />
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

      {/* About Dialog */}
      <Dialog open={aboutOpen} onClose={handleAboutClose}>
        <DialogTitle>About DSS Project MMI</DialogTitle>
        <DialogContent>
          <Typography>
            Welcome to DSS Project MMI
            <br />
            24/546050/PPA/06833 - Aziz Hendra Atmadja
            <br />
            24/548101/PPA/06919 - Marta Zuriadi
            <br />
            24/548140/PPA/06921 - Silvanus Satno Nugraha
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAboutClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Main History Section */}
      <Container
        sx={{
          backgroundColor: "white",
          width: "70%",
          padding: "2rem",
          borderRadius: "10px",
          mt: 4,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Calculation History
        </Typography>
        {savedResults.map((result) => (
          <ListItem key={result.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ListItemText
              primary={result.method_name}
              secondary={`Score: ${result.score}`}
            />
            <Box>
              <IconButton color="error" onClick={() => deleteResult(result.id)}>
                <DeleteIcon />
              </IconButton>
              <IconButton color="primary" onClick={() => viewResult(result.id)}>
                <ArrowForwardIcon />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </Container>
    </Box>
  );
}