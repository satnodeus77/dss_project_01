import { useState } from "react";
import {
  Box, Container, Typography, IconButton, Select, TextField, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, Paper, Checkbox
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

export default function CalculatorPage({ user, method, setMethod, criteria, setCriteria, alternatives, setAlternatives, results, setResults, calculateResults, saveResults }) {
  return (
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
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton color="error" onClick={() => setCriteria(criteria.filter((_, i) => i !== index))}>
              <DeleteIcon />
            </IconButton>
            <Checkbox
              checked={c.active}
              onChange={() => {
                const updatedCriteria = [...criteria];
                updatedCriteria[index].active = !updatedCriteria[index].active;
                setCriteria(updatedCriteria);
              }}
              color="primary"
            />
          </Box>
        </Box>
      ))}
      <Button startIcon={<AddIcon />} onClick={() => setCriteria([...criteria, { name: "", type: "Benefit", weight: "", active: true }])}>Add Criteria</Button>

      {/* Alternatives Section */}
      <Typography variant="h6" sx={{ mt: 3 }}>Alternatives</Typography>
      <Button
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
        onClick={() => setAlternatives([...alternatives, { name: "", values: Array(criteria.length).fill(""), active: true }])}
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
                      onChange={(e) => {
                        const updatedAlternatives = [...alternatives];
                        updatedAlternatives[altIndex].values[critIndex] = e.target.value || "";
                        setAlternatives(updatedAlternatives);
                      }}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton color="error" onClick={() => setAlternatives(alternatives.filter((_, i) => i !== altIndex))}>
                      <DeleteIcon />
                    </IconButton>
                    <Checkbox
                      checked={alt.active}
                      onChange={() => {
                        const updatedAlternatives = [...alternatives];
                        updatedAlternatives[altIndex].active = !updatedAlternatives[altIndex].active;
                        setAlternatives(updatedAlternatives);
                      }}
                      color="primary"
                    />
                  </Box>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Results</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveResults}
            >
              Save
            </Button>
          </Box>
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
  );
}