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

  const updateAlternativeValue = (altIndex, critIndex, value) => {
    const updatedAlternatives = [...alternatives];
    updatedAlternatives[altIndex].values[critIndex] = value || "";
    setAlternatives(updatedAlternatives);
  };

  const calculateResults = () => {
    let calculatedResults = [];

    if (method === "SAW") {
      calculatedResults = calculateSAW();
    } else if (method === "TOPSIS") {
      calculatedResults = calculateTOPSIS();
    } else if (method === "WP") {
      calculatedResults = calculateWP();
    }

    setResults(calculatedResults);
  };

  const calculateSAW = () => {
    const normalizedAlternatives = alternatives.map((alt) => {
      const normalizedValues = alt.values.map((value, index) => {
        const criterion = criteria[index];
        const maxValue = Math.max(...alternatives.map((a) => parseFloat(a.values[index])));
        const minValue = Math.min(...alternatives.map((a) => parseFloat(a.values[index])));
        return criterion.type === "Benefit" ? value / maxValue : minValue / value;
      });
      return { ...alt, normalizedValues };
    });

    const scores = normalizedAlternatives.map((alt) => {
      const score = alt.normalizedValues.reduce((acc, value, index) => {
        return acc + value * parseFloat(criteria[index].weight);
      }, 0);
      return { name: alt.name, score };
    });

    return scores.sort((a, b) => b.score - a.score);
  };

  const calculateTOPSIS = () => {
    const normalizedAlternatives = alternatives.map((alt) => {
      const normalizedValues = alt.values.map((value, index) => {
        const sumOfSquares = Math.sqrt(alternatives.reduce((acc, a) => acc + Math.pow(parseFloat(a.values[index]), 2), 0));
        return value / sumOfSquares;
      });
      return { ...alt, normalizedValues };
    });

    const weightedAlternatives = normalizedAlternatives.map((alt) => {
      const weightedValues = alt.normalizedValues.map((value, index) => value * parseFloat(criteria[index].weight));
      return { ...alt, weightedValues };
    });

    const idealBest = criteria.map((criterion, index) => {
      return criterion.type === "Benefit"
        ? Math.max(...weightedAlternatives.map((alt) => alt.weightedValues[index]))
        : Math.min(...weightedAlternatives.map((alt) => alt.weightedValues[index]));
    });

    const idealWorst = criteria.map((criterion, index) => {
      return criterion.type === "Benefit"
        ? Math.min(...weightedAlternatives.map((alt) => alt.weightedValues[index]))
        : Math.max(...weightedAlternatives.map((alt) => alt.weightedValues[index]));
    });

    const scores = weightedAlternatives.map((alt) => {
      const distanceToBest = Math.sqrt(alt.weightedValues.reduce((acc, value, index) => acc + Math.pow(value - idealBest[index], 2), 0));
      const distanceToWorst = Math.sqrt(alt.weightedValues.reduce((acc, value, index) => acc + Math.pow(value - idealWorst[index], 2), 0));
      const score = distanceToWorst / (distanceToBest + distanceToWorst);
      return { name: alt.name, score };
    });

    return scores.sort((a, b) => b.score - a.score);
  };

  const calculateWP = () => {
    const scores = alternatives.map((alt) => {
      const score = alt.values.reduce((acc, value, index) => {
        return acc * Math.pow(parseFloat(value), parseFloat(criteria[index].weight));
      }, 1);
      return { name: alt.name, score };
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
        paddingTop: "40px",
      }}
    >
      {/* Header Section (Not Sticky) */}
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
            <TextField
              fullWidth
              label="Criteria Name"
              value={c.name}
              onChange={(e) => {
                const updatedCriteria = [...criteria];
                updatedCriteria[index].name = e.target.value;
                setCriteria(updatedCriteria);
              }}
            />
            <Select
              value={c.type}
              onChange={(e) => {
                const updatedCriteria = [...criteria];
                updatedCriteria[index].type = e.target.value;
                setCriteria(updatedCriteria);
              }}
            >
              <MenuItem value="Benefit">Benefit</MenuItem>
              <MenuItem value="Cost">Cost</MenuItem>
            </Select>
            <TextField
              type="number"
              label="Weight"
              value={c.weight}
              onChange={(e) => {
                const updatedCriteria = [...criteria];
                updatedCriteria[index].weight = e.target.value;
                setCriteria(updatedCriteria);
              }}
            />
            <IconButton color="error" onClick={() => setCriteria(criteria.filter((_, i) => i !== index))}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={() => setCriteria([...criteria, { name: "", type: "Benefit", weight: "" }])}>Add Criteria</Button>

        {/* Alternatives Section */}
        <Typography variant="h6" sx={{ mt: 3 }}>Alternatives</Typography>
        <Button
          startIcon={<AddIcon />}
          sx={{ mb: 2 }}
          onClick={() => setAlternatives([...alternatives, { name: "", values: Array(criteria.length).fill("") }])}
        >
          Add Alternative
        </Button>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Alternative Name</TableCell>
                {criteria.map((c, index) => (
                  <TableCell key={index}>{c.name || `Criteria ${index + 1}`}</TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alternatives.map((alt, altIndex) => (
                <TableRow key={altIndex}>
                  <TableCell>
                    <TextField
                      fullWidth
                      value={alt.name}
                      onChange={(e) => {
                        const updatedAlternatives = [...alternatives];
                        updatedAlternatives[altIndex].name = e.target.value;
                        setAlternatives(updatedAlternatives);
                      }}
                    />
                  </TableCell>
                  {criteria.map((_, critIndex) => (
                    <TableCell key={critIndex}>
                      <TextField
                        type="number"
                        value={alt.values[critIndex] || ""}
                        onChange={(e) => updateAlternativeValue(altIndex, critIndex, e.target.value)}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <IconButton color="error" onClick={() => removeAlternative(altIndex)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button fullWidth variant="contained" onClick={calculateResults}>Calculate Results</Button>

        {/* Results Section */}
        {results.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>Results</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Alternative Name</TableCell>
                    <TableCell>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{result.name}</TableCell>
                      <TableCell>{result.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Container>
    </Box>
  );
}