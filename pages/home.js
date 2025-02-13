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
      {/* User Profile and Logout Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
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

      {/* Homepage Content */}
      <Container>
        <Typography variant="h3" sx={{ color: "white", fontWeight: "bold", textAlign: "center", mt: 4 }}>
          Welcome to DSS Project MMI
        </Typography>
        <Typography variant="h6" sx={{ color: "white", textAlign: "center", mt: 2 }}>
          Your decision support system starts here.
        </Typography>
      </Container>
    </Box>
  );
}
