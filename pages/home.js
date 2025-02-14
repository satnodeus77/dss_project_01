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

  const removeAlternative = (index) => {
    setAlternatives(alternatives.filter((_, i) => i !== index));
  };

  // 🔥 Function to Calculate Rankings Based on Selected Method
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

  // ✅ TOPSIS Calculation
  const calculateTOPSIS = () => {
    let normalized = alternatives.map(alt => ({
      name: alt.name,
      values: alt.values.map((val, i) =>
        val / Math.sqrt(alternatives.reduce((sum, a) => sum + a.values[i] ** 2, 0))
      )
    }));

    let weighted = normalized.map(alt => ({
      name: alt.name,
      values: alt.values.map((val, i) => val * criteria[i].weight)
    }));

    let idealBest = criteria.map((crit, i) =>
      crit.type === "Benefit"
        ? Math.max(...weighted.map(a => a.values[i]))
        : Math.min(...weighted.map(a => a.values[i]))
    );

    let idealWorst = criteria.map((crit, i) =>
      crit.type === "Benefit"
        ? Math.min(...weighted.map(a => a.values[i]))
        : Math.max(...weighted.map(a => a.values[i]))
    );

    let scores = weighted.map(alt => {
      let distBest = Math.sqrt(alt.values.reduce((sum, val, i) => sum + (val - idealBest[i]) ** 2, 0));
      let distWorst = Math.sqrt(alt.values.reduce((sum, val, i) => sum + (val - idealWorst[i]) ** 2, 0));
      return {
        name: alt.name,
        score: distWorst / (distBest + distWorst)
      };
    });

    return scores;
  };

  // ✅ WP Calculation
  const calculateWP = () => {
    let scores = alternatives.map(alt => ({
      name: alt.name,
      score: alt.values.reduce((prod, val, i) =>
        prod * Math.pow(val, (criteria[i].type === "Benefit" ? 1 : -1) * criteria[i].weight), 1)
    }));

    return scores;
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

        {/* Calculate Button */}
        <Button fullWidth startIcon={<CalculateIcon />} variant="contained" onClick={calculateResults}>
          Calculate Results
        </Button>

        {/* Results Section */}
        {results.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Alternative</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((res, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{res.name}</TableCell>
                    <TableCell>{res.score.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
