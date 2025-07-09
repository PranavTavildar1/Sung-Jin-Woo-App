import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Assignment as QuestIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import { apiService, skillCategories } from '../utils/userUtils';

const Quests = ({ userId, user, setUser }) => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadQuests();
  }, [userId]);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const questsData = await apiService.getQuests(userId);
      setQuests(questsData.quests || []);
    } catch (error) {
      console.error('Error loading quests:', error);
      setMessage({ type: 'error', text: 'Failed to load quests.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (questId) => {
    try {
      setLoading(true);
      const response = await apiService.completeQuest(userId, questId);
      
      setQuests(response.quests);
      setUser(response.user);
      
      if (response.leveledUp) {
        setMessage({ 
          type: 'success', 
          text: '🎉 Quest completed! Skill leveled up!' 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: '✅ Quest completed! +50 XP earned.' 
        });
      }
    } catch (error) {
      console.error('Error completing quest:', error);
      setMessage({ type: 'error', text: 'Failed to complete quest.' });
    } finally {
      setLoading(false);
    }
  };

  const getCompletedCount = () => {
    return quests.filter(quest => quest.completed).length;
  };

  const getProgressPercentage = () => {
    if (quests.length === 0) return 0;
    return (getCompletedCount() / quests.length) * 100;
  };

  if (loading && quests.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading quests...</Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
        🎯 Daily Quests
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* Progress Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Today's Progress
            </Typography>
            <Chip
              label={`${getCompletedCount()}/${quests.length} Completed`}
              color="primary"
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressPercentage()}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#4CAF50',
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {getProgressPercentage().toFixed(0)}% complete
          </Typography>
        </CardContent>
      </Card>

      {/* Quests Grid */}
      <Grid container spacing={3}>
        {quests.map((quest) => (
          <Grid item xs={12} md={6} lg={4} key={quest.id}>
            <Card 
              sx={{ 
                height: '100%',
                opacity: quest.completed ? 0.7 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="flex-start" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: quest.completed ? '#4CAF50' : skillCategories[quest.skill]?.color,
                      mr: 2,
                      mt: 0.5,
                    }}
                  >
                    {quest.completed ? <CompleteIcon /> : <QuestIcon />}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {quest.title}
                    </Typography>
                    <Chip
                      label={skillCategories[quest.skill]?.name}
                      size="small"
                      sx={{
                        bgcolor: skillCategories[quest.skill]?.color,
                        color: 'white',
                      }}
                    />
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Reward: +{quest.xpReward} XP
                  </Typography>
                  {quest.completed ? (
                    <Chip
                      icon={<CompleteIcon />}
                      label="Completed"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleCompleteQuest(quest.id)}
                      disabled={loading}
                      startIcon={<CompleteIcon />}
                    >
                      Complete
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {quests.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <QuestIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No quests available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back tomorrow for new daily quests!
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💡 Quest Tips
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Complete quests to earn bonus XP and level up faster
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Quests reset daily at midnight
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Focus on quests that match your current goals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Completing all quests gives you a significant XP boost!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Quests; 