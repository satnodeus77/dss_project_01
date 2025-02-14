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
    <Box sx={{ minHeight: "100vh", backgroundImage: "url('/dss-background.jpg')", backgroundSize: "cover", backgroundPosition: "center", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px" }}>
      <Box sx={{ width: "100%", backgroundColor: "rgba(0, 0, 0, 0.6)", color: "white", display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "10px 20px" }}>
        {user && (
          <>
            <Typography variant="body1" onClick={() => setAboutOpen(true)} sx={{ fontWeight: "bold", textTransform: "none", marginRight: 2, cursor: "pointer" }}>About</Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold", marginRight: 2 }}>{user.displayName}</Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar src={user.photoURL} sx={{ width: 40, height: 40 }} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>{user.email}</MenuItem>
              <MenuItem onClick={() => auth.signOut().then(() => router.push("/"))}><LogoutIcon sx={{ mr: 1 }} />Logout</MenuItem>
            </Menu>
          </>
        )}
      </Box>
      <Container sx={{ backgroundColor: "white", width: "70%", padding: "2rem", borderRadius: "10px", mt: 4, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>Decision Support System Framework</Typography>
        <Typography variant="h6">Decision Support Method</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            <MenuItem value="SAW">Simple Additive Weighting (SAW)</MenuItem>
            <MenuItem value="TOPSIS">TOPSIS</MenuItem>
            <MenuItem value="WP">Weighted Product Model (WP)</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="h6">Criteria</Typography>
        {criteria.map((c, index) => (
          <Box key={index} sx={{ display: "flex", gap: 2, mb: 1 }}>
            <TextField fullWidth label="Criteria Name" value={c.name} onChange={(e) => updateCriteria(index, "name", e.target.value)} />
            <Select value={c.type} onChange={(e) => updateCriteria(index, "type", e.target.value)}>
              <MenuItem value="Benefit">Benefit</MenuItem>
              <MenuItem value="Cost">Cost</MenuItem>
            </Select>
            <TextField type="number" label="Weight" value={c.weight} onChange={(e) => updateCriteria(index, "weight", e.target.value)} />
          </Box>
        ))}
      </Container>
    </Box>
  );
}
