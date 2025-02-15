import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box, Container, Typography, IconButton, Menu, MenuItem, Avatar, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import CalculateIcon from "@mui/icons-material/Calculate";
import HistoryIcon from "@mui/icons-material/History";
import { auth } from "../lib/firebase";

export default function HistoryCalculationPage() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [calculations, setCalculations] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
        fetchCalculations(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchCalculations = async (userId) => {
    try {
      const response = await fetch(`/api/getCalculations?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCalculations(data);
      } else {
        console.error('Failed to fetch calculations');
      }
    } catch (error) {
      console.error('Error fetching calculations:', error);
    }
  };

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
              onClick={() => router.push('/historyCalculationPage')}
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
          This page displays the history of your calculations.
        </Typography>

        {calculations.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Criteria</TableCell>
                  <TableCell>Alternatives</TableCell>
                  <TableCell>Rank Results</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calculations.map((calculation) => (
                  <TableRow key={calculation.id}>
                    <TableCell>{new Date(calculation.created_at).toLocaleString()}</TableCell>
                    <TableCell>{calculation.method}</TableCell>
                    <TableCell>
                      {calculation.criteria.map((criterion, index) => (
                        <div key={index}>
                          <strong>{criterion.name}</strong>: {criterion.value} ({criterion.type}, Weight: {criterion.weight})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {calculation.alternatives.map((alternative, index) => (
                        <div key={index}>
                          <strong>{alternative.name}</strong>:
                          {Object.entries(alternative.values).map(([key, value]) => (
                            <div key={key}>{key}: {value}</div>
                          ))}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {calculation.rank_results.map((result, index) => (
                        <div key={index}>
                          <strong>{result.name}</strong>, Score {result.score}
                        </div>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" sx={{ mt: 2 }}>
            No calculations found.
          </Typography>
        )}
      </Container>
    </Box>
  );
}