"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Button, Paper, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { parse } from "papaparse";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { SelectChangeEvent } from "@mui/material/Select";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

export default function Dashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [sentimentOptions] = useState([
    { value: "", label: "All" },
    { value: "positive", label: "Positive 😊" },
    { value: "negative", label: "Negative 😠" },
    { value: "neutral", label: "Neutral 😐" },
    { value: "professional", label: "Professional 👔" },
    { value: "unprofessional", label: "Unprofessional ⚠️" },
    { value: "urgent", label: "Urgent 🚨" },
    { value: "friendly", label: "Friendly 🤝" }
  ]);

  useEffect(() => {
    // Check if API key exists in localStorage
    const apiKey = localStorage.getItem("zoomFilterApiKey");
    if (!apiKey) {
      router.push("/auth");
    }
  }, [router]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target?.result as string;
        const results = parse(csvData, {
          header: false,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        setData(results.data);
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
  };

  const handleSenderChange = (event: SelectChangeEvent) => {
    setSender(event.target.value);
  };

  const handleReceiverChange = (event: SelectChangeEvent) => {
    setReceiver(event.target.value);
  };

  const handleSentimentChange = (event: SelectChangeEvent) => {
    setSentiment(event.target.value);
  };

  const filteredData = data.slice(1).filter((row) => {
    const matchesKeyword = row.some((cell: any) => String(cell).toLowerCase().includes(keyword.toLowerCase()));
    const matchesDate = date ? row.some((cell: any) => String(cell).includes(date.toISOString().split('T')[0])) : true;
    const matchesSender = sender ? String(row[1]) === sender : true;
    const matchesReceiver = receiver ? String(row[2]) === receiver : true;
    
    // Analyze message content for sentiment
    const messageContent = String(row[4]).toLowerCase();
    let matchesSentiment = true;
    
    if (sentiment) {
      switch (sentiment) {
        case 'positive':
          matchesSentiment = messageContent.includes('great') || 
                           messageContent.includes('excellent') || 
                           messageContent.includes('good') || 
                           messageContent.includes('happy') || 
                           messageContent.includes('thanks') || 
                           messageContent.includes('thank you') ||
                           messageContent.includes('awesome') ||
                           messageContent.includes('perfect');
          break;
        case 'negative':
          matchesSentiment = messageContent.includes('unacceptable') || 
                           messageContent.includes('bad') || 
                           messageContent.includes('wrong') || 
                           messageContent.includes('fail') || 
                           messageContent.includes('error') || 
                           messageContent.includes('issue') ||
                           messageContent.includes('problem') ||
                           messageContent.includes('fix');
          break;
        case 'urgent':
          matchesSentiment = messageContent.includes('urgent') || 
                           messageContent.includes('asap') || 
                           messageContent.includes('emergency') || 
                           messageContent.includes('critical') || 
                           messageContent.includes('immediately') || 
                           messageContent.includes('right now');
          break;
        case 'professional':
          matchesSentiment = messageContent.includes('please') || 
                           messageContent.includes('documentation') || 
                           messageContent.includes('review') || 
                           messageContent.includes('update') || 
                           messageContent.includes('handle') || 
                           messageContent.includes('situation') ||
                           messageContent.includes('discuss') ||
                           messageContent.includes('solution');
          break;
        case 'unprofessional':
          matchesSentiment = messageContent.includes('shut up') || 
                           messageContent.includes('stupid') || 
                           messageContent.includes('idiot') || 
                           messageContent.includes('dumb') || 
                           messageContent.includes('useless') || 
                           messageContent.includes('waste');
          break;
        case 'friendly':
          matchesSentiment = messageContent.includes('hey') || 
                           messageContent.includes('hi') || 
                           messageContent.includes('hello') || 
                           messageContent.includes('guys') || 
                           messageContent.includes('team') || 
                           messageContent.includes('checking in') ||
                           messageContent.includes('how are you') ||
                           messageContent.includes('doing well');
          break;
        case 'neutral':
          matchesSentiment = !messageContent.match(/great|excellent|good|happy|thanks|bad|wrong|fail|error|issue|urgent|asap|emergency|critical|please|documentation|review|update|handle|situation|discuss|solution|shut up|stupid|idiot|dumb|useless|waste|hey|hi|hello|guys|team|checking in|how are you|doing well/i);
          break;
      }
    }
    
    return matchesKeyword && matchesDate && matchesSender && matchesReceiver && matchesSentiment;
  });

  const uniqueSenders = Array.from(new Set(data.slice(1).map(row => String(row[1])))).sort();
  const uniqueReceivers = Array.from(new Set(data.slice(1).map(row => String(row[2])))).sort();
  const uniqueSentiments = Array.from(new Set(data.slice(1).map(row => String(row[5])))).sort();

  const rowsWithId = filteredData.map((row, index) => ({
    id: index,
    'Session Id': row[0],
    'Sender': row[1],
    'Receiver': row[2],
    'Message Time (UTC)': row[3],
    'Message': row[4],
    'Emoji': row[5],
    'File': row[6],
    'Giphy': row[7],
    'Edited/Deleted': row[8],
    'Edited/Deleted Time (UTC)': row[9],
  }));

  const columns = [
    { field: 'Session Id', headerName: 'Session ID', width: 130 },
    { field: 'Sender', headerName: 'Sender', width: 130 },
    { field: 'Receiver', headerName: 'Receiver', width: 130 },
    { field: 'Message Time (UTC)', headerName: 'Time', width: 180 },
    { field: 'Message', headerName: 'Message', width: 300 },
    { field: 'Emoji', headerName: 'Emoji', width: 100 },
    { field: 'File', headerName: 'File', width: 100 },
    { field: 'Giphy', headerName: 'Giphy', width: 100 },
    { field: 'Edited/Deleted', headerName: 'Status', width: 100 },
    { field: 'Edited/Deleted Time (UTC)', headerName: 'Edit Time', width: 180 },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f6f7f9 0%, #e9eef5 100%)',
      py: 8 
    }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          }}
        >
          Message Dashboard
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#666',
            mb: 6,
            maxWidth: '800px',
            mx: 'auto',
            textAlign: 'center'
          }}
        >
          Upload your Zoom chat history and use the filters below to find specific messages
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4, mb: 6 }}>
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
            <CloudUploadIcon sx={{ fontSize: 40, color: '#2196F3', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Upload CSV File
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ 
                width: '100%', 
                height: '56px',
                borderColor: '#2196F3',
                color: '#2196F3',
                '&:hover': {
                  borderColor: '#1976D2',
                  backgroundColor: 'rgba(33, 150, 243, 0.04)'
                }
              }}
            >
              {file ? file.name : 'Choose File'}
              <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
            </Button>
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
            <SearchIcon sx={{ fontSize: 40, color: '#2196F3', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Search
            </Typography>
            <TextField
              fullWidth
              label="Keyword"
              value={keyword}
              onChange={handleKeywordChange}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#2196F3',
                  },
                },
              }}
            />
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
              Date Filter
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={date}
                onChange={handleDateChange}
                sx={{ 
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#2196F3',
                    },
                  },
                }}
              />
            </LocalizationProvider>
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
            <PersonIcon sx={{ fontSize: 40, color: '#2196F3', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Sender Filter
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="sender-label">Select Sender</InputLabel>
              <Select 
                labelId="sender-label"
                value={sender} 
                onChange={handleSenderChange}
                label="Select Sender"
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196F3',
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                {uniqueSenders.map((sender) => (
                  <MenuItem key={sender} value={sender}>{sender}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
              Receiver Filter
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="receiver-label">Select Receiver</InputLabel>
              <Select 
                labelId="receiver-label"
                value={receiver} 
                onChange={handleReceiverChange}
                label="Select Receiver"
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196F3',
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                {uniqueReceivers.map((receiver) => (
                  <MenuItem key={receiver} value={receiver}>{receiver}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmojiEmotionsIcon sx={{ fontSize: 40, color: '#2196F3' }} />
              <Typography variant="h6">
                Message Tone
                <Typography
                  component="span"
                  sx={{
                    ml: 1,
                    fontSize: '0.75rem',
                    color: '#fff',
                    backgroundColor: '#2196F3',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 'bold'
                  }}
                >
                  BETA
                </Typography>
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Filter messages based on their emotional tone and professionalism level
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="sentiment-label">Select Message Tone</InputLabel>
              <Select 
                labelId="sentiment-label"
                value={sentiment} 
                onChange={handleSentimentChange}
                label="Select Message Tone"
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196F3',
                  },
                }}
              >
                {sentimentOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Box>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4,
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#2196F3',
                fontWeight: 600
              }}
            >
              Messages
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                backgroundColor: '#f5f5f5',
                px: 2,
                py: 1,
                borderRadius: 1
              }}
            >
              Showing {filteredData.length} results
            </Typography>
          </Box>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={rowsWithId}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 100 },
                },
              }}
              pageSizeOptions={[100]}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell:hover': {
                  color: '#2196F3',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                },
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
              }}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 