"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Button, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Grid, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { parse } from "papaparse";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { SelectChangeEvent } from "@mui/material/Select";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import { format, isWithinInterval, parseISO } from "date-fns";

// Sentiment analysis using Hugging Face API
const analyzeSentimentBatch = async (messages: string[]): Promise<Record<string, string>> => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/finiteautomata/bertweet-base-sentiment-analysis",
      {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}` },
        method: "POST",
        body: JSON.stringify({ inputs: messages }),
      }
    );
    const results = await response.json();
    
    const sentiments: Record<string, string> = {};
    if (Array.isArray(results)) {
      results.forEach((result, index) => {
        if (result && result[0]) {
          const sentiment = result[0];
          switch (sentiment.label) {
            case 'POS':
              sentiments[messages[index]] = 'positive';
              break;
            case 'NEG':
              sentiments[messages[index]] = 'negative';
              break;
            case 'NEU':
              sentiments[messages[index]] = 'neutral';
              break;
            default:
              sentiments[messages[index]] = 'neutral';
          }
        } else {
          sentiments[messages[index]] = 'neutral';
        }
      });
    }
    return sentiments;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    // Return neutral for all messages in case of error
    return messages.reduce((acc, msg) => ({ ...acc, [msg]: 'neutral' }), {});
  }
};

export default function Dashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
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
  const [messageSentiments, setMessageSentiments] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    // Check if API key exists in localStorage
    const apiKey = localStorage.getItem("zoomFilterApiKey");
    if (!apiKey) {
      router.push("/auth");
    }
  }, [router]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvData = event.target?.result as string;
        const results = parse(csvData, {
          header: false,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        setData(results.data);

        // Get unique messages for sentiment analysis
        const messages = Array.from(new Set(
          results.data.slice(1)
            .map((row: any) => String(row[4]))
            .filter(Boolean)
        ));

        setAnalysisProgress(30); // File parsed

        // Analyze sentiments in batches
        const sentiments = await analyzeSentimentBatch(messages);
        setMessageSentiments(sentiments);
        setAnalysisProgress(100);
        setIsAnalyzing(false);
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const handleStartDateChange = (newDate: Date | null) => {
    setStartDate(newDate);
  };

  const handleEndDateChange = (newDate: Date | null) => {
    setEndDate(newDate);
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

  const handleClearFilters = () => {
    setKeyword("");
    setStartDate(null);
    setEndDate(null);
    setSender("");
    setReceiver("");
    setSentiment("");
  };

  const filteredData = data.slice(1).filter((row) => {
    const matchesKeyword = keyword
      ? row.some((cell: any) => String(cell).toLowerCase().includes(keyword.toLowerCase()))
      : true;

    const messageDate = parseISO(row[3]);
    let matchesDateRange = true;
    
    if (startDate && endDate) {
      // Ensure start date is before end date
      const [start, end] = startDate > endDate ? [endDate, startDate] : [startDate, endDate];
      matchesDateRange = isWithinInterval(messageDate, { start, end });
    } else if (startDate) {
      matchesDateRange = messageDate >= startDate;
    } else if (endDate) {
      matchesDateRange = messageDate <= endDate;
    }

    const matchesSender = sender ? String(row[1]) === sender : true;
    const matchesReceiver = receiver ? String(row[2]) === receiver : true;
    const message = String(row[4]);
    const messageSentiment = messageSentiments[message] || 'neutral';
    const matchesSentiment = sentiment ? messageSentiment === sentiment : true;

    return matchesKeyword && matchesDateRange && matchesSender && matchesReceiver && matchesSentiment;
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

  const columns: GridColDef[] = [
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

  const handleExport = () => {
    // Get the headers from the original data
    const headers = data[0] as string[];
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => row.join(','))
    ].join('\n');

    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `filtered_messages_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f6f7f9 0%, #e9eef5 100%)',
      py: 8 
    }}>
      <Container maxWidth="xl">
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            sx={{
              color: '#666',
              borderColor: '#666',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderColor: '#666',
              }
            }}
          >
            Clear All Filters
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CloudUploadIcon sx={{ fontSize: 40, color: '#2196F3' }} />
                <Typography variant="h6">
                  Upload CSV File
                  {isAnalyzing && (
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
                      Analyzing Messages...
                    </Typography>
                  )}
                </Typography>
              </Box>
              <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={isAnalyzing}
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
                {isAnalyzing && (
                  <CircularProgress
                    variant="determinate"
                    value={analysisProgress}
                    size={24}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#2196F3',
                    }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
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
          </Grid>

          <Grid item xs={12} md={6}>
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
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
          </Grid>

          <Grid item xs={12} md={6}>
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
          </Grid>

          <Grid item xs={12}>
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
          </Grid>
        </Grid>

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                sx={{
                  color: '#2196F3',
                  borderColor: '#2196F3',
                  '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.04)',
                    borderColor: '#1976D2',
                  }
                }}
              >
                Export CSV
              </Button>
            </Box>
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