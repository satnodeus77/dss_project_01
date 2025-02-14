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
    <Container sx={{ mt: 4, backgroundColor: "white", padding: "2rem", borderRadius: "10px" }}>
      <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
        Decision Support System Framework
      </Typography>

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
  );
}
