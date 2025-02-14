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

  const addCriterion = () => {
    setCriteria([...criteria, { name: "", type: "Benefit", weight: "" }]);
    setAlternatives(alternatives.map(alt => ({
      ...alt,
      values: [...alt.values, ""]
    })));
  };

  const updateCriterion = (index, field, value) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index][field] = value;
    setCriteria(updatedCriteria);
  };

  const removeCriterion = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
    setAlternatives(alternatives.map(alt => {
      alt.values.splice(index, 1);
      return alt;
    }));
  };

  const addAlternative = () => {
    setAlternatives([...alternatives, { name: "", values: Array(criteria.length).fill("") }]);
  };

  const updateAlternative = (altIndex, field, value) => {
    const updatedAlternatives = [...alternatives];
    updatedAlternatives[altIndex][field] = value;
    setAlternatives(updatedAlternatives);
  };

  const updateAlternativeValue = (altIndex, critIndex, value) => {
    const updatedAlternatives = [...alternatives];
    updatedAlternatives[altIndex].values[critIndex] = value;
    setAlternatives(updatedAlternatives);
  };

  const removeAlternative = (index) => {
    setAlternatives(alternatives.filter((_, i) => i !== index));
  };

  const calculateResults = () => {
    if (method === "SAW") {
      const normalized = alternatives.map(alt => ({
        name: alt.name,
        score: criteria.reduce((sum, crit, i) => {
          const value = parseFloat(alt.values[i]) || 0;
          return sum + value * parseFloat(crit.weight || 0);
        }, 0)
      }));

      normalized.sort((a, b) => b.score - a.score);
      setResults(normalized);
    }

    if (method === "TOPSIS") {
      const idealBest = criteria.map((_, i) => Math.max(...alternatives.map(a => parseFloat(a.values[i]) || 0)));
      const idealWorst = criteria.map((_, i) => Math.min(...alternatives.map(a => parseFloat(a.values[i]) || 0)));

      const scores = alternatives.map(alt => ({
        name: alt.name,
        score: criteria.reduce((sum, _, i) => {
          const value = parseFloat(alt.values[i]) || 0;
          const bestDiff = Math.pow(value - idealBest[i], 2);
          const worstDiff = Math.pow(value - idealWorst[i], 2);
          return sum + worstDiff / (bestDiff + worstDiff);
        }, 0)
      }));

      scores.sort((a, b) => b.score - a.score);
      setResults(scores);
    }

    if (method === "WP") {
      const weightedProducts = alternatives.map(alt => ({
        name: alt.name,
        score: criteria.reduce((product, crit, i) => {
          const value = parseFloat(alt.values[i]) || 1;
          return product * Math.pow(value, parseFloat(crit.weight || 0));
        }, 1)
      }));

      weightedProducts.sort((a, b) => b.score - a.score);
      setResults(weightedProducts);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundImage: "url('/dss-background.jpg')", backgroundSize: "cover" }}>
      
      {/* Header (Username, About, Logout) */}
      <Box sx={{ width: "100%", backgroundColor: "rgba(0, 0, 0, 0.6)", color: "white", display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "10px 20px" }}>
        {user && (
          <>
            <Typography variant="body1" onClick={handleAboutOpen} sx={{ fontWeight: "bold", textTransform: "none", marginRight: 2, cursor: "pointer" }}>
              About
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: "bold", marginRight: 2 }}>
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
          </>
        )}
      </Box>

      {/* Main Content */}
      <Container sx={{ backgroundColor: "white", width: "70%", padding: "2rem", borderRadius: "10px" }}>
        <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
          Decision Support System Framework
        </Typography>

        {/* DSS Method Selection */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>Decision Support Method</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            <MenuItem value="SAW">SAW</MenuItem>
            <MenuItem value="TOPSIS">TOPSIS</MenuItem>
            <MenuItem value="WP">WP</MenuItem>
          </Select>
        </FormControl>

        <Button fullWidth variant="contained" startIcon={<CalculateIcon />} onClick={calculateResults}>Calculate Results</Button>

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
