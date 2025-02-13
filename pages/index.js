import { useEffect, useState } from "react";
import { auth, provider, signInWithPopup } from "../lib/firebase";
import { Container, Box, Typography, Button, Paper } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import Image from "next/image";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error", error);
    }
  };

  const logout = () => {
    auth.signOut();
    setUser(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('/dss-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, textAlign: "center", backdropFilter: "blur(8px)", backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", color: "blue" }}>
            DSS Project MMI
          </Typography>

          <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
            Sign in to continue
          </Typography>

          {user ? (
            <Box mt={3}>
              <Typography variant="h6">{user.displayName}</Typography>
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
              <Button variant="contained" color="error" onClick={logout} fullWidth sx={{ mt: 2 }}>
                Logout
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<GoogleIcon />}
              onClick={loginWithGoogle}
              fullWidth
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Sign in with Google
            </Button>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
