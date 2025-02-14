import { useEffect, useState } from "react";
import {
  Box, Container, Typography, IconButton, ListItem, ListItemText
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function HistoryPage({ user }) {
  const [savedResults, setSavedResults] = useState([]);

  useEffect(() => {
    const fetchSavedResults = async () => {
      try {
        const response = await fetch(`/api/getResults?userId=${user.uid}`);
        const data = await response.json();
        setSavedResults(data.results);
      } catch (error) {
        console.error('Error fetching saved results:', error);
      }
    };

    fetchSavedResults();
  }, [user]);

  const deleteResult = async (resultId) => {
    try {
      await fetch(`/api/deleteResult?id=${resultId}`, { method: 'DELETE' });
      setSavedResults(savedResults.filter(result => result.id !== resultId));
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  };

  const viewResult = (resultId) => {
    // Implement view result functionality
  };

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
        Calculation History
      </Typography>
      {savedResults.map((result) => (
        <ListItem key={result.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ListItemText
            primary={result.method_name}
            secondary={`Score: ${result.score}`}
          />
          <Box>
            <IconButton color="error" onClick={() => deleteResult(result.id)}>
              <DeleteIcon />
            </IconButton>
            <IconButton color="primary" onClick={() => viewResult(result.id)}>
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        </ListItem>
      ))}
    </Container>
  );
}