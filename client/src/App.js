import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import Skills from './components/Skills';
import Quests from './components/Quests';
import Rewards from './components/Rewards';

// Services
import { generateUserId } from './utils/userUtils';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate or retrieve user ID
    const storedUserId = localStorage.getItem('sungJinWooUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = generateUserId();
      localStorage.setItem('sungJinWooUserId', newUserId);
      setUserId(newUserId);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <div className="pulse">Loading Sung Jin Woo App...</div>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Header userId={userId} user={user} setUser={setUser} />
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Routes>
              <Route 
                path="/" 
                element={<Dashboard userId={userId} user={user} setUser={setUser} />} 
              />
              <Route 
                path="/journal" 
                element={<Journal userId={userId} user={user} setUser={setUser} />} 
              />
              <Route 
                path="/skills" 
                element={<Skills userId={userId} user={user} setUser={setUser} />} 
              />
              <Route 
                path="/quests" 
                element={<Quests userId={userId} user={user} setUser={setUser} />} 
              />
              <Route 
                path="/rewards" 
                element={<Rewards userId={userId} user={user} setUser={setUser} />} 
              />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 