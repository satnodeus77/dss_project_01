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
            {/* About Button (Same font size as username) */}
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

        {/* DSS Method Selection - Label Fixed */}
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
                {criteria.map((c, index) => <TableCell key={index}>{c.name || `Criteria ${index + 1}`}</TableCell>)}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alternatives.map((alt, altIndex) => (
                <TableRow key={altIndex}>
                  <TableCell><TextField fullWidth value={alt.name} /></TableCell>
                  {criteria.map((_, critIndex) => <TableCell key={critIndex}><TextField type="number" /></TableCell>)}
                  <TableCell><IconButton color="error"><DeleteIcon /></IconButton></TableCell>
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
