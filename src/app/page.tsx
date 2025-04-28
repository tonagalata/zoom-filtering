"use client";

import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function Home() {
  const router = useRouter();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f6f7f9 0%, #e9eef5 100%)',
      py: 8 
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Zoom Message Filter
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#666',
              mb: 4,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Efficiently search, filter, and analyze your Zoom chat history. Find important messages quickly and gain insights from your conversations.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => router.push('/auth')}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Go to Dashboard
          </Button>
        </Box>

        {/* Features Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <SearchIcon sx={{ fontSize: 40, color: '#2196F3', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Keyword Search
            </Typography>
            <Typography color="text.secondary">
              Quickly find specific messages using keyword search across your entire chat history.
            </Typography>
          </Paper>

          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 40, color: '#2196F3', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Date Filtering
            </Typography>
            <Typography color="text.secondary">
              Filter messages by date to focus on conversations from specific time periods.
            </Typography>
          </Paper>

          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <GroupIcon sx={{ fontSize: 40, color: '#2196F3', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Participant Filtering
            </Typography>
            <Typography color="text.secondary">
              Find messages from specific participants or conversations between particular users.
            </Typography>
          </Paper>

          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <FilterAltIcon sx={{ fontSize: 40, color: '#2196F3', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Advanced Filtering
            </Typography>
            <Typography color="text.secondary">
              Filter by message type, including emojis, files, and edited messages.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
