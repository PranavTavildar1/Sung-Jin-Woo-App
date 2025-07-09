import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import { skillCategories, calculateProgress, calculateXPForLevel } from '../utils/userUtils';

const Skills = ({ userId, user, setUser }) => {
  const [skills, setSkills] = useState({});

  useEffect(() => {
    if (user?.skills) {
      setSkills(user.skills);
    }
  }, [user]);

  const getSkillCards = () => {
    return Object.entries(skills).map(([skillKey, skill]) => {
      const category = skillCategories[skillKey];
      const progress = calculateProgress(skill.xp, skill.level);
      const xpForNextLevel = calculateXPForLevel(skill.level + 1);

      return (
        <Grid item xs={12} sm={6} md={4} key={skillKey}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: category?.color,
                    width: 48,
                    height: 48,
                    mr: 2,
                    fontSize: '20px',
                  }}
                >
                  {category?.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6">{category?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Level {skill.level}
                  </Typography>
                </Box>
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Progress</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: category?.color,
                    },
                  }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {skill.xp} / {xpForNextLevel} XP
                </Typography>
                <Chip
                  label={`Total: ${skill.totalXP} XP`}
                  size="small"
                  sx={{
                    bgcolor: category?.color,
                    color: 'white',
                  }}
                />
              </Box>

              {skill.level % 5 === 0 && (
                <Paper
                  sx={{
                    mt: 2,
                    p: 1,
                    bgcolor: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                  }}
                >
                  <Typography variant="body2" color="warning.main" textAlign="center">
                    🏆 Milestone reached!
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      );
    });
  };

  const getTotalStats = () => {
    const totalLevel = Object.values(skills).reduce((sum, skill) => sum + skill.level, 0);
    const totalXP = Object.values(skills).reduce((sum, skill) => sum + skill.totalXP, 0);
    const highestLevel = Math.max(...Object.values(skills).map(skill => skill.level));
    const averageLevel = totalLevel / Object.keys(skills).length;

    return { totalLevel, totalXP, highestLevel, averageLevel };
  };

  const stats = getTotalStats();

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
        📊 Skills Tree
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.totalLevel}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Level
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.totalXP}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total XP
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.highestLevel}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Highest Level
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.averageLevel.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Level
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Skills Grid */}
      <Grid container spacing={3}>
        {getSkillCards()}
      </Grid>

      {/* Tips */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💡 How to Level Up
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Write detailed journal entries about your experiences
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Complete daily quests to earn bonus XP
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Focus on specific skills in your journal entries
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Every 5 levels unlocks special rewards!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Skills; 