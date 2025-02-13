import { useEffect, useState } from "react";
import { auth, provider, signInWithPopup } from "../lib/firebase";
import { Container, Box, Typography, Button, Paper } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

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
    <Container maxWidth="sm" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper elevation={6} style={{ padding: "2rem", textAlign: "center", width: "100%" }}>
        <Typography variant="h4" color="primary" gutterBottom>
          DSS Project
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Sign in to continue
        </Typography>

        {user ? (
          <Box mt={3}>
            <Typography variant="h6">{user.displayName}</Typography>
            <Typography variant="body2" color="textSecondary">
              {user.email}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={logout}
              fullWidth
              style={{ marginTop: "1rem" }}
            >
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
            style={{ marginTop: "1.5rem" }}
          >
            Sign in with Google
          </Button>
        )}
      </Paper>
    </Container>
  );
}
