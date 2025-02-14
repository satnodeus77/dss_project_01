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
  const [method, setMethod] = useState("SAW");
  const [criteria, setCriteria] = useState([{ name: "", type: "Benefit", weight: "" }]);
  const [alternatives, setAlternatives] = useState([]);
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

  const updateCriteria = (index, field, value) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index][field] = value;
    setCriteria(updatedCriteria);
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

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px" }}>
      <Container sx={{ backgroundColor: "white", width: "70%", padding: "2rem", borderRadius: "10px", mt: 4, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>Decision Support System Framework</Typography>

        {/* DSS Method Selection */}
        <Typography variant="h6">Decision Support Method</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            <MenuItem value="SAW">Simple Additive Weighting (SAW)</MenuItem>
            <MenuItem value="TOPSIS">TOPSIS</MenuItem>
            <MenuItem value="WP">Weighted Product Model (WP)</MenuItem>
          </Select>
        </FormControl>

        {/* Criteria Section */}
        <Typography variant="h6">Criteria</Typography>
        {criteria.map((c, index) => (
          <Box key={index} sx={{ display: "flex", gap: 2, mb: 1 }}>
            <TextField fullWidth label="Criteria Name" value={c.name} onChange={(e) => updateCriteria(index, "name", e.target.value)} />
            <Select value={c.type} onChange={(e) => updateCriteria(index, "type", e.target.value)}>
              <MenuItem value="Benefit">Benefit</MenuItem>
              <MenuItem value="Cost">Cost</MenuItem>
            </Select>
            <TextField type="number" label="Weight" value={c.weight} onChange={(e) => updateCriteria(index, "weight", e.target.value)} />
            <IconButton color="error" onClick={() => setCriteria(criteria.filter((_, i) => i !== index))}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={() => setCriteria([...criteria, { name: "", type: "Benefit", weight: "" }])}>Add Criteria</Button>

        {/* Alternatives Section */}
        <Typography variant="h6" sx={{ mt: 3 }}>Alternatives</Typography>
        <Button startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => setAlternatives([...alternatives, { name: "", values: Array(criteria.length).fill("") }])}>Add Alternative</Button>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Alternative Name</TableCell>
                {criteria.map((c, index) => (<TableCell key={index}>{c.name || `Criteria ${index + 1}`}</TableCell>))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alternatives.map((alt, altIndex) => (
                <TableRow key={altIndex}>
                  <TableCell>
                    <TextField fullWidth value={alt.name} onChange={(e) => updateAlternative(altIndex, "name", e.target.value)} />
                  </TableCell>
                  {criteria.map((_, critIndex) => (
                    <TableCell key={critIndex}>
                      <TextField type="number" value={alt.values[critIndex] || ""} onChange={(e) => updateAlternativeValue(altIndex, critIndex, e.target.value)} />
                    </TableCell>
                  ))}
                  <TableCell>
                    <IconButton color="error" onClick={() => setAlternatives(alternatives.filter((_, i) => i !== altIndex))}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button fullWidth variant="contained">Calculate Results</Button>
      </Container>
    </Box>
  );
}
