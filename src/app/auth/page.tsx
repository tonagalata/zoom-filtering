"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, TextField, Button, Paper, Alert } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';

export default function AuthPage() {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        // Store the API key in localStorage for future requests
        localStorage.setItem("zoomFilterApiKey", apiKey);
        router.push("/dashboard");
      } else {
        setError("Invalid API key. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f6f7f9 0%, #e9eef5 100%)',
      py: 8 
    }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
          }}
        >
          <LockIcon sx={{ fontSize: 40, color: '#2196F3' }} />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Authentication Required
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Please enter your Access key to access the dashboard
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Access Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                py: 1.5,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
            >
              Access Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 