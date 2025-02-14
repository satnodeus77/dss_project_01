import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box, Container, Typography, IconButton, Menu, MenuItem, Avatar,
  Select, TextField, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Checkbox
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import { auth } from "../lib/firebase";

export default function CalculatorPage() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [method, setMethod] = useState("SAW");
  const [criteria, setCriteria] = useState([{ name: "", type: "Benefit", weight: "", active: true }]);
  const [alternatives, setAlternatives] = useState([]);
  const [results, setResults] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveError, setSaveError] = useState(null);

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

  const updateAlternativeValue = (altIndex, critIndex, value) => {
    const updatedAlternatives = [...alternatives];
    updatedAlternatives[altIndex].values[critIndex] = value || "";
    setAlternatives(updatedAlternatives);
  };

  const toggleAlternativeActive = (index) => {
    const updatedAlternatives = [...alternatives];
    updatedAlternatives[index].active = !updatedAlternatives[index].active;
    setAlternatives(updatedAlternatives);
  };

  const toggleCriteriaActive = (index) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index].active = !updatedCriteria[index].active;
    setCriteria(updatedCriteria);
  };

  const normalizeWeights = (criteria) => {
    const totalWeight = criteria.reduce((acc, c) => acc + parseFloat(c.weight), 0);
    return criteria.map(c => ({ ...c, weight: parseFloat(c.weight) / totalWeight }));
  };

  const calculateResults = () => {
    let calculatedResults = [];

    const normalizedCriteria = normalizeWeights(criteria.filter(c => c.active));

    if (method === "SAW") {
      calculatedResults = calculateSAW(normalizedCriteria);
    } else if (method === "TOPSIS") {
      calculatedResults = calculateTOPSIS(normalizedCriteria);
    } else if (method === "WP") {
      calculatedResults = calculateWP(normalizedCriteria);
    }

    setResults(calculatedResults);
  };

  const calculateSAW = (normalizedCriteria) => {
    const activeAlternatives = alternatives.filter(a => a.active);

    const normalizedAlternatives = activeAlternatives.map((alt) => {
      const normalizedValues = alt.values.map((value, index) => {
        const criterion = normalizedCriteria[index];
        const maxValue = Math.max(...activeAlternatives.map((a) => parseFloat(a.values[index])));
        const minValue = Math.min(...activeAlternatives.map((a) => parseFloat(a.values[index])));
        return criterion.type === "Benefit" ? value / maxValue : minValue / value;
      });
      return { ...alt, normalizedValues };
    });

    const scores = normalizedAlternatives.map((alt) => {
      const score = alt.normalizedValues.reduce((acc, value, index) => {
        return acc + value * normalizedCriteria[index].weight;
      }, 0);
      return { name: alt.name, score: parseFloat(score.toFixed(3)) };
    });

    return scores.sort((a, b) => b.score - a.score);
  };

  const calculateTOPSIS = (normalizedCriteria) => {
    const activeAlternatives = alternatives.filter(a => a.active);

    const normalizedAlternatives = activeAlternatives.map((alt) => {
      const normalizedValues = alt.values.map((value, index) => {
        const sumOfSquares = Math.sqrt(activeAlternatives.reduce((acc, a) => acc + Math.pow(parseFloat(a.values[index]), 2), 0));
        return value / sumOfSquares;
      });
      return { ...alt, normalizedValues };
    });

    const weightedAlternatives = normalizedAlternatives.map((alt) => {
      const weightedValues = alt.normalizedValues.map((value, index) => value * normalizedCriteria[index].weight);
      return { ...alt, weightedValues };
    });

    const idealBest = normalizedCriteria.map((criterion, index) => {
      return criterion.type === "Benefit"
        ? Math.max(...weightedAlternatives.map((alt) => alt.weightedValues[index]))
        : Math.min(...weightedAlternatives.map((alt) => alt.weightedValues[index]));
    });

    const idealWorst = normalizedCriteria.map((criterion, index) => {
      return criterion.type === "Benefit"
        ? Math.min(...weightedAlternatives.map((alt) => alt.weightedValues[index]))
        : Math.max(...weightedAlternatives.map((alt) => alt.weightedValues[index]));
    });

    const scores = weightedAlternatives.map((alt) => {
      const distanceToBest = Math.sqrt(alt.weightedValues.reduce((acc, value, index) => acc + Math.pow(value - idealBest[index], 2), 0));
      const distanceToWorst = Math.sqrt(alt.weightedValues.reduce((acc, value, index) => acc + Math.pow(value - idealWorst[index], 2), 0));
      const score = distanceToWorst / (distanceToBest + distanceToWorst);
      return { name: alt.name, score: parseFloat(score.toFixed(3)) };
    });

    return scores.sort((a, b) => b.score - a.score);
  };

  const calculateWP = (normalizedCriteria) => {
    const activeAlternatives = alternatives.filter(a => a.active);

    const scores = activeAlternatives.map((alt) => {
      const score = alt.values.reduce((acc, value, index) => {
        return acc * Math.pow(parseFloat(value), normalizedCriteria[index].weight);
      }, 1);
      return { name: alt.name, score: parseFloat(score.toFixed(3)) };
    });

    return scores.sort((a, b) => b.score - a.score);
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
          <>
            {/* About Button */}
            <Typography
              variant="body1"
              onClick={handleAboutOpen}
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                marginRight: 2,
                cursor: "pointer",
              }}
            >
              About
            </Typography>

            {/* User Info */}
            <Typography variant="body1" sx={{ fontWeight: "bold", marginRight: 2 }}>
              {user.displayName}
            </Typography>

            {/* User Avatar */}
            <IconButton onClick={handleMenuOpen}>
              <Avatar src={user.photoURL} sx={{ width: 40, height: 40 }} />
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

      {/* About Dialog */}
      <Dialog open={aboutOpen} onClose={handleAboutClose}>
        <DialogTitle>About DSS Project MMI</DialogTitle>
        <DialogContent>
          <Typography>
            Welcome to DSS Project MMI
            <br />
            24/546050/PPA/06833 - Aziz Hendra Atmadja
            <br />
            24/548101/PPA/06919 - Marta Zuriadi
            <br />
            24/548140/PPA/06921 - Silvanus Satno Nugraha
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAboutClose}>Close</Button>
        </DialogActions>
      </Dialog>

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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Decision Support System Framework
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="contained"
              startIcon={<CalculateIcon />}
              sx={{ mr: 1 }}
              onClick={() => router.push('/CalculatorPage')}
            >
              Calculator
            </Button>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => router.push('/HistoryPage')}
            >
              History
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}