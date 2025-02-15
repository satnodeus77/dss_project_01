import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, provider, signInWithPopup } from "../lib/firebase";
import { Container, Box, Typography, Button, Paper } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        router.push("/home"); // ✅ Redirect to homepage after login
      }
    });
  }, [router]);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);

      // Add user to the database
      await fetch('/api/saveUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
        }),
      });

      router.push("/home"); // ✅ Redirect after login
    } catch (error) {
      console.error("Login Error", error);
    }
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
            <Typography variant="h6" sx={{ mt: 2 }}>
              Redirecting to homepage...
            </Typography>
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