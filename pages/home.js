import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import {
  Box, Container, Typography, IconButton, Menu, MenuItem, Avatar,
  Select, TextField, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [method, setMethod] = useState("SAW");
  const [criteria, setCriteria] = useState([{ name: "", type: "Benefit", weight: "" }]);
  const [alternatives, setAlternatives] = useState([]);
  const [results, setResults] = useState([]);

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

  // ✅ Function to Add Criteria
  const addCriterion = () => {
    setCriteria([...criteria, { name: "", type: "Benefit", weight: "" }]);

    // Ensure new criteria is added for each alternative
    setAlternatives(alternatives.map(alt => ({
      ...alt,
      values: [...alt.values, ""]
    })));
  };

  // ✅ Function to Remove Criteria
  const removeCriterion = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));

    // Remove corresponding values from alternatives
    setAlternatives(alternatives.map(alt => {
      alt.values.splice(index, 1);
      return alt;
    }));
  };

  // ✅ Function to Add Alternative
  const addAlternative = () => {
    setAlternatives([...alternatives, { name: "", values: Array(criteria.length).fill("") }]);
  };

  // ✅ Function to Remove Alternative
  const removeAlternative = (index) => {
    setAlternatives(alternatives.filter((_, i) => i !== index));
  };

  // ✅ Function to Calculate Rankings Based on Selected Method
  const calculateResults = () => {
    if (!alternatives.length || !criteria.length) {
      alert("Please add criteria and alternatives before calculating!");
      return;
    }

    let scores = [];

    if (method === "SAW") {
      scores = calculateSAW();
    } else if (method === "TOPSIS") {
      scores = calculateTOPSIS();
    } else if (method === "WP") {
      scores = calculateWP();
    }

    // Sorting results (Descending Order: Best Alternative First)
    scores.sort((a, b) => b.score - a.score);
    setResults(scores);
  };

  // ✅ SAW Calculation
  const calculateSAW = () => {
    let normalized = alternatives.map(alt => ({
      name: alt.name,
      values: alt.values.map((val, i) => {
        if (criteria[i].type === "Benefit") {
          return val / Math.max(...alternatives.map(a => a.values[i]));
        } else {
          return Math.min(...alternatives.map(a => a.values[i])) / val;
        }
      })
    }));

    let scoredAlternatives = normalized.map(alt => ({
      name: alt.name,
      score: alt.values.reduce((sum, val, i) => sum + val * criteria[i].weight, 0)
    }));

    return scoredAlternatives;
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
        paddingTop: "40px",
      }}
    >
      <Container sx={{ backgroundColor: "white", width: "70%", padding: "2rem", borderRadius: "10px" }}>
        <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
          Decision Support System Framework
        </Typography>

        {/* DSS Method Selection */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          Decision Support Method
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            <MenuItem value="SAW">Simple Additive Weighting (SAW)</MenuItem>
            <MenuItem value="TOPSIS">Technique for Order Preference by Similarity to Ideal Solution (TOPSIS)</MenuItem>
            <MenuItem value="WP">Weighted Product Model (WP)</MenuItem>
          </Select>
        </FormControl>

        {/* Criteria Section */}
        <Typography variant="h6">Criteria</Typography>
        {criteria.map((c, index) => (
          <Box key={index} sx={{ display: "flex", gap: 2, mb: 1 }}>
            <TextField fullWidth label="Criteria Name" value={c.name} />
            <Select value={c.type}>
              <MenuItem value="Benefit">Benefit</MenuItem>
              <MenuItem value="Cost">Cost</MenuItem>
            </Select>
            <TextField type="number" label="Weight" value={c.weight} />
            <IconButton color="error" onClick={() => removeCriterion(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={addCriterion}>Add Criteria</Button>

        {/* Alternatives Section */}
        <Typography variant="h6" sx={{ mt: 3 }}>Alternatives</Typography>
        <Button startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={addAlternative}>Add Alternative</Button>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Alternative Name</TableCell>
                {criteria.map((c, index) => <TableCell key={index}>{c.name || `Criteria ${index + 1}`}</TableCell>)}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alternatives.map((alt, altIndex) => (
                <TableRow key={altIndex}>
                  <TableCell><TextField fullWidth value={alt.name} /></TableCell>
                  {criteria.map((_, critIndex) => <TableCell key={critIndex}><TextField type="number" /></TableCell>)}
                  <TableCell><IconButton color="error" onClick={() => removeAlternative(altIndex)}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button fullWidth startIcon={<CalculateIcon />} variant="contained" onClick={calculateResults}>Calculate Results</Button>
      </Container>
    </Box>
  );
}
