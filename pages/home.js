import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import {
  Box, Container, Typography, IconButton, Menu, MenuItem, Avatar,
  Select, TextField, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, InputLabel, Paper
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [method, setMethod] = useState("SAW");
  const [criteria, setCriteria] = useState([{ name: "", type: "Benefit", weight: "" }]);
  const [alternatives, setAlternatives] = useState([]);

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

    // Add an empty value for each alternative when a new criterion is added
    setAlternatives(alternatives.map(alt => ({
      ...alt,
      values: [...alt.values, ""]
    })));
  };

  // Remove a criterion
  const removeCriterion = (index) => {
    const updatedCriteria = [...criteria];
    updatedCriteria.splice(index, 1);
    setCriteria(updatedCriteria);

    // Remove corresponding values from each alternative
    setAlternatives(alternatives.map(alt => {
      alt.values.splice(index, 1);
      return alt;
    }));
  };

  // Add an alternative
  const addAlternative = () => {
    setAlternatives([...alternatives, { name: "", values: Array(criteria.length).fill("") }]);
  };

  // Remove an alternative
  const removeAlternative = (index) => {
    const updatedAlternatives = [...alternatives];
    updatedAlternatives.splice(index, 1);
    setAlternatives(updatedAlternatives);
  };

  // Update an alternative name
  const updateAlternativeName = (index, value) => {
    const updatedAlternatives = [...alternatives];
    updatedAlternatives[index].name = value;
    setAlternatives(updatedAlternatives);
  };

  // Update an alternative value
  const updateAlternativeValue = (altIndex, critIndex, value) => {
    const updatedAlternatives = [...alternatives];
    updatedAlternatives[altIndex].values[critIndex] = value;
    setAlternatives(updatedAlternatives);
  };

  // Calculate results (Placeholder for SAW/TOPSIS/WP logic)
  const calculateResults = () => {
    console.log("Calculating results...");
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

        {/* Criteria Section */}
        <Typography variant="h6">Criteria</Typography>
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

        {/* Alternatives Table */}
        <Typography variant="h6" sx={{ mt: 3 }}>Alternatives</Typography>
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
                      onChange={(e) => updateAlternativeName(altIndex, e.target.value)}
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

        <Button fullWidth startIcon={<CalculateIcon />} variant="contained" onClick={calculateResults}>
          Calculate Results
        </Button>
        <Button startIcon={<AddIcon />} onClick={addAlternative}>Add Alternative</Button>
      </Container>
    </Box>
  );
}
