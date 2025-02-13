import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import {
  Box, Container, Typography, IconButton, Menu, MenuItem, Avatar,
  Select, TextField, Button, Card, CardContent, Grid, FormControl, InputLabel
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [method, setMethod] = useState("SAW"); // Default method
  const [criteria, setCriteria] = useState([{ name: "", type: "Benefit", weight: "" }]);
  const [alternatives, setAlternatives] = useState([{ name: "", values: [] }]);
  const [results, setResults] = useState([]);

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

  // Add a new criterion
  const addCriterion = () => {
    setCriteria([...criteria, { name: "", type: "Benefit", weight: "" }]);
  };

  // Remove a criterion
  const removeCriterion = (index) => {
    const updatedCriteria = [...criteria];
    updatedCriteria.splice(index, 1);
    setCriteria(updatedCriteria);
  };

  // Add an alternative
  const addAlternative = () => {
    setAlternatives([...alternatives, { name: "", values: [] }]);
  };

  // Remove an alternative
  const removeAlternative = (index) => {
    const updatedAlternatives = [...alternatives];
    updatedAlternatives.splice(index, 1);
    setAlternatives(updatedAlternatives);
  };

  // Calculate results (dummy function)
  const calculateResults = () => {
    // TODO: Implement actual SAW, TOPSIS, WP logic
    setResults([
      { name: "Roni", score: 0.98, rank: 1 },
      { name: "Ayu", score: 0.81, rank: 2 },
      { name: "Ani", score: 0.26, rank: 3 }
    ]);
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
      }}
    >
      {/* User Profile & Logout Button */}
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

      {/* Main DSS Section */}
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
        <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
          Decision Support System Framework
        </Typography>

        {/* Method Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>DSS Method</InputLabel>
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            <MenuItem value="SAW">Simple Additive Weighted (SAW)</MenuItem>
            <MenuItem value="TOPSIS">Technique for Order Preference by Similarity to Ideal Solution (TOPSIS)</MenuItem>
            <MenuItem value="WP">Weighted Product Model (WP)</MenuItem>
          </Select>
        </FormControl>

        {/* Criteria Section */}
        <Typography variant="h6" sx={{ mt: 2 }}>Criteria</Typography>
        {criteria.map((c, index) => (
          <Box key={index} sx={{ display: "flex", gap: 2, mb: 1 }}>
            <TextField fullWidth label="Criteria Name" value={c.name} onChange={(e) => {
              const newCriteria = [...criteria];
              newCriteria[index].name = e.target.value;
              setCriteria(newCriteria);
            }} />
            <Select value={c.type} onChange={(e) => {
              const newCriteria = [...criteria];
              newCriteria[index].type = e.target.value;
              setCriteria(newCriteria);
            }}>
              <MenuItem value="Benefit">Benefit</MenuItem>
              <MenuItem value="Cost">Cost</MenuItem>
            </Select>
            <TextField type="number" label="Weight" value={c.weight} onChange={(e) => {
              const newCriteria = [...criteria];
              newCriteria[index].weight = e.target.value;
              setCriteria(newCriteria);
            }} />
            <IconButton color="error" onClick={() => removeCriterion(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={addCriterion}>Add Criteria</Button>

        {/* Alternative Section */}
        <Typography variant="h6" sx={{ mt: 3 }}>Alternatives</Typography>
        {alternatives.map((a, index) => (
          <Box key={index} sx={{ display: "flex", gap: 2, mb: 1 }}>
            <TextField fullWidth label="Alternative Name" value={a.name} onChange={(e) => {
              const newAlternatives = [...alternatives];
              newAlternatives[index].name = e.target.value;
              setAlternatives(newAlternatives);
            }} />
            <IconButton color="error" onClick={() => removeAlternative(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={addAlternative}>Add Alternative</Button>

        {/* Calculate Results */}
        <Button fullWidth startIcon={<CalculateIcon />} variant="contained" sx={{ mt: 3 }} onClick={calculateResults}>
          Calculate Results
        </Button>
      </Container>
    </Box>
  );
}
