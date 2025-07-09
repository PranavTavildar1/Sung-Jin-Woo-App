import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Assignment as QuestIcon,
  Book as JournalIcon,
} from '@mui/icons-material';
import { apiService, skillCategories, calculateProgress } from '../utils/userUtils';

const Dashboard = ({ userId, user, setUser }) => {
  const [loading, setLoading] = useState(true);
  const [recentEntries, setRecentEntries] = useState([]);
  const [quests, setQuests] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load user data
        const userData = await apiService.getUser(userId);
        setUser(userData.user);

        // Load recent journal entries
        const entriesData = await apiService.getJournalEntries(userId, 3);
        setRecentEntries(entriesData.entries || []);

        // Load daily quests
        const questsData = await apiService.getQuests(userId);
        setQuests(questsData.quests || []);

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    if (userId) {
      loadDashboardData();
    }
  }, [userId, setUser]);

  const getTopSkills = () => {
    if (!user?.skills) return [];
    return Object.entries(user.skills)
      .sort(([, a], [, b]) => b.level - a.level || b.totalXP - a.totalXP)
      .slice(0, 3);
  };

  const getCompletedQuests = () => {
    return quests.filter(quest => quest.completed).length;
  };

  const getTotalQuests = () => {
    return quests.length;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
        Welcome back, Warrior! ⚔️
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon sx={{ color: '#667eea', mr: 1 }} />
                <Typography variant="h6">Total XP</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {user?.totalXP || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Experience gained
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrophyIcon sx={{ color: '#FFD700', mr: 1 }} />
                <Typography variant="h6">Total Level</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {user?.skills ? Object.values(user.skills).reduce((total, skill) => total + skill.level, 0) : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Combined skill levels
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <QuestIcon sx={{ color: '#4CAF50', mr: 1 }} />
                <Typography variant="h6">Daily Quests</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {getCompletedQuests()}/{getTotalQuests()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quests completed today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <JournalIcon sx={{ color: '#9C27B0', mr: 1 }} />
                <Typography variant="h6">Journal Entries</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {user?.journalEntries?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total entries written
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Skills */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏆 Top Skills
              </Typography>
              {getTopSkills().map(([skillKey, skill]) => (
                <Box key={skillKey} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ 
                        bgcolor: skillCategories[skillKey]?.color,
                        width: 32,
                        height: 32,
                        mr: 1,
                        fontSize: '14px'
                      }}>
                        {skillCategories[skillKey]?.icon}
                      </Avatar>
                      <Typography variant="body1">
                        {skillCategories[skillKey]?.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Lv.{skill.level}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(skill.xp, skill.level)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: skillCategories[skillKey]?.color,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {skill.xp} / {Math.floor(100 * Math.pow(1.5, skill.level))} XP
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚡ Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    component={Link}
                    to="/journal"
                    variant="contained"
                    fullWidth
                    sx={{ height: 60 }}
                  >
                    📝 New Entry
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    component={Link}
                    to="/quests"
                    variant="outlined"
                    fullWidth
                    sx={{ height: 60 }}
                  >
                    🎯 View Quests
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    component={Link}
                    to="/skills"
                    variant="outlined"
                    fullWidth
                    sx={{ height: 60 }}
                  >
                    📊 Skills Tree
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    component={Link}
                    to="/rewards"
                    variant="outlined"
                    fullWidth
                    sx={{ height: 60 }}
                  >
                    🏆 Rewards
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📖 Recent Journal Entries
                </Typography>
                {recentEntries.map((entry) => (
                  <Paper key={entry.id} sx={{ p: 2, mb: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={`+${entry.xpEarned} XP`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {entry.content.length > 100 
                        ? `${entry.content.substring(0, 100)}...` 
                        : entry.content
                      }
                    </Typography>
                    {entry.analysis && Object.keys(entry.analysis).length > 0 && (
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {Object.entries(entry.analysis).map(([skill, confidence]) => (
                          <Chip
                            key={skill}
                            label={`${skillCategories[skill]?.name} ${confidence}%`}
                            size="small"
                            sx={{
                              bgcolor: skillCategories[skill]?.color,
                              color: 'white',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 