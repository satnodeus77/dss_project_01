import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box, Container, Typography, IconButton, Menu, MenuItem, Avatar,
  Select, TextField, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, Paper, Checkbox
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";
import HistoryIcon from "@mui/icons-material/History";
import { auth } from "../lib/firebase";

export default function CalculatorPage() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [method, setMethod] = useState("SAW");
  const [criteria, setCriteria] = useState([{ name: "", type: "Benefit", weight: "", active: true }]);
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
  
    // Normalize the Decision Matrix
    const normalizedAlternatives = activeAlternatives.map((alt) => {
      const normalizedValues = alt.values.map((value, index) => {
        const criterion = normalizedCriteria[index];
        const maxValue = Math.max(...activeAlternatives.map((a) => parseFloat(a.values[index])));
        const minValue = Math.min(...activeAlternatives.map((a) => parseFloat(a.values[index])));
        return criterion.type === "Benefit" ? value / maxValue : minValue / value;
      });
      return { ...alt, normalizedValues };
    });
  
    // Multiply by Weights
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
  
    // Step 2: Normalize the Decision Matrix
    const normalizedAlternatives = activeAlternatives.map((alt) => {
      const normalizedValues = alt.values.map((value, index) => {
        const sumOfSquares = Math.sqrt(activeAlternatives.reduce((acc, a) => acc + Math.pow(parseFloat(a.values[index]), 2), 0));
        return value / sumOfSquares;
      });
      return { ...alt, normalizedValues };
    });
  
    // Step 3: Calculate the Weighted Normalized Matrix
    const weightedAlternatives = normalizedAlternatives.map((alt) => {
      const weightedValues = alt.normalizedValues.map((value, index) => value * normalizedCriteria[index].weight);
      return { ...alt, weightedValues };
    });
  
    // Step 4: Determine Ideal Best and Ideal Worst
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
  
    // Step 5: Calculate Distance to Ideal Best and Worst
    const scores = weightedAlternatives.map((alt) => {
      const distanceToBest = Math.sqrt(alt.weightedValues.reduce((acc, value, index) => acc + Math.pow(value - idealBest[index], 2), 0));
      const distanceToWorst = Math.sqrt(alt.weightedValues.reduce((acc, value, index) => acc + Math.pow(value - idealWorst[index], 2), 0));
      const score = distanceToWorst / (distanceToBest + distanceToWorst);
      return { name: alt.name, score: parseFloat(score.toFixed(3)) };
    });
  
    // Step 6: Final TOPSIS Ranking
    return scores.sort((a, b) => b.score - a.score);
  };

  const calculateWP = (normalizedCriteria) => {
    const activeAlternatives = alternatives.filter(a => a.active);
  
    // Step 1: Convert Cost Criteria to Benefits
    const convertedAlternatives = activeAlternatives.map((alt) => {
      const convertedValues = alt.values.map((value, index) => {
        const criterion = normalizedCriteria[index];
        return criterion.type === "Cost" ? 1 / value : value;
      });
      return { ...alt, convertedValues };
    });
  
    // Step 2: Compute the Weighted Product
    const scores = convertedAlternatives.map((alt) => {
      const score = alt.convertedValues.reduce((acc, value, index) => {
        return acc * Math.pow(parseFloat(value), normalizedCriteria[index].weight);
      }, 1);
      return { name: alt.name, score: parseFloat(score.toFixed(3)) };
    });
  
    // Step 3: Rank the Alternatives
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
              onClick={() => router.push('/historyPage')}
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
        </Box>

        {/* Calculator Functionality */}
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              displayEmpty
            >
              <MenuItem value="SAW">SAW</MenuItem>
              <MenuItem value="TOPSIS">TOPSIS</MenuItem>
              <MenuItem value="WP">WP</MenuItem>
            </Select>
          </FormControl>

          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Criteria</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {criteria.map((criterion, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        value={criterion.name}
                        onChange={(e) => {
                          const updatedCriteria = [...criteria];
                          updatedCriteria[index].name = e.target.value;
                          setCriteria(updatedCriteria);
                        }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={criterion.type}
                        onChange={(e) => {
                          const updatedCriteria = [...criteria];
                          updatedCriteria[index].type = e.target.value;
                          setCriteria(updatedCriteria);
                        }}
                        fullWidth
                      >
                        <MenuItem value="Benefit">Benefit</MenuItem>
                        <MenuItem value="Cost">Cost</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={criterion.weight}
                        onChange={(e) => {
                          const updatedCriteria = [...criteria];
                          updatedCriteria[index].weight = e.target.value;
                          setCriteria(updatedCriteria);
                        }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={criterion.active}
                        onChange={() => toggleCriteriaActive(index)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => {
                        const updatedCriteria = criteria.filter((_, i) => i !== index);
                        setCriteria(updatedCriteria);
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCriteria([...criteria, { name: "", type: "Benefit", weight: "", active: true }])}
            sx={{ mb: 2 }}
          >
            Add Criterion
          </Button>

          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Alternative</TableCell>
                  {criteria.map((criterion, index) => (
                    <TableCell key={index}>{criterion.name}</TableCell>
                  ))}
                  <TableCell>Active</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alternatives.map((alternative, altIndex) => (
                  <TableRow key={altIndex}>
                    <TableCell>
                      <TextField
                        value={alternative.name}
                        onChange={(e) => {
                          const updatedAlternatives = [...alternatives];
                          updatedAlternatives[altIndex].name = e.target.value;
                          setAlternatives(updatedAlternatives);
                        }}
                        fullWidth
                      />
                    </TableCell>
                    {criteria.map((criterion, critIndex) => (
                      <TableCell key={critIndex}>
                        <TextField
                          type="number"
                          value={alternative.values[critIndex]}
                          onChange={(e) => updateAlternativeValue(altIndex, critIndex, e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Checkbox
                        checked={alternative.active}
                        onChange={() => toggleAlternativeActive(altIndex)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => removeAlternative(altIndex)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAlternatives([...alternatives, { name: "", values: Array(criteria.length).fill(""), active: true }])}
              sx={{ mb: 2 }}
            >
              Add Alternative
            </Button>

            <Button
              variant="contained"
              startIcon={<CalculateIcon />}
              onClick={calculateResults}
              sx={{ mb: 2, backgroundColor: "#4caf50", '&:hover': { backgroundColor: "#45a049" } }}
            >
              Calculate
            </Button>
          </Box>

          {results.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Alternative</TableCell>
                    <TableCell>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.name}</TableCell>
                      <TableCell>{result.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Container>
    </Box>
  );
}

//test
