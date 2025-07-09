import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  MilitaryTech as AchievementIcon,
} from '@mui/icons-material';
import { apiService, skillCategories } from '../utils/userUtils';

const Rewards = ({ userId, user, setUser }) => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, [userId]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const rewardsData = await apiService.getRewards(userId);
      setRewards(rewardsData.rewards || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneRewards = () => {
    if (!user?.skills) return [];
    
    const milestones = [];
    Object.entries(user.skills).forEach(([skillKey, skill]) => {
      const category = skillCategories[skillKey];
      if (skill.level >= 5) {
        const milestoneLevel = Math.floor(skill.level / 5) * 5;
        milestones.push({
          id: `${skillKey}_${milestoneLevel}`,
          skill: skillKey,
          level: milestoneLevel,
          name: category?.name,
          icon: category?.icon,
          color: category?.color,
          description: `Reached Level ${milestoneLevel} in ${category?.name}`,
          earned: skill.level >= milestoneLevel,
        });
      }
    });
    
    return milestones.sort((a, b) => b.level - a.level);
  };

  const getAchievementStats = () => {
    if (!user?.skills) return { totalMilestones: 0, totalLevel: 0, averageLevel: 0 };
    
    const totalLevel = Object.values(user.skills).reduce((sum, skill) => sum + skill.level, 0);
    const averageLevel = totalLevel / Object.keys(user.skills).length;
    const totalMilestones = getMilestoneRewards().filter(r => r.earned).length;
    
    return { totalMilestones, totalLevel, averageLevel };
  };

  const stats = getAchievementStats();
  const milestones = getMilestoneRewards();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading rewards...</Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
        🏆 Rewards & Achievements
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrophyIcon sx={{ fontSize: 48, color: '#FFD700', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {stats.totalMilestones}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Milestones Reached
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 48, color: '#FFD700', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {stats.totalLevel}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Skill Levels
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AchievementIcon sx={{ fontSize: 48, color: '#FFD700', mb: 1 }} />
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

      {/* Milestones */}
      <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 2 }}>
        🎯 Skill Milestones
      </Typography>
      
      <Grid container spacing={3}>
        {milestones.map((milestone) => (
          <Grid item xs={12} sm={6} md={4} key={milestone.id}>
            <Card 
              sx={{ 
                height: '100%',
                opacity: milestone.earned ? 1 : 0.6,
                transition: 'all 0.3s ease',
                ...(milestone.earned && {
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                }),
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: milestone.earned ? '#FFD700' : milestone.color,
                      width: 48,
                      height: 48,
                      mr: 2,
                      fontSize: '20px',
                    }}
                  >
                    {milestone.earned ? '🏆' : milestone.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {milestone.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Level {milestone.level}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {milestone.description}
                </Typography>

                {milestone.earned ? (
                  <Chip
                    icon={<TrophyIcon />}
                    label="Achieved!"
                    color="success"
                    sx={{ bgcolor: '#FFD700', color: 'black' }}
                  />
                ) : (
                  <Chip
                    label="Locked"
                    color="default"
                    variant="outlined"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {milestones.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <TrophyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No milestones yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reach Level 5 in any skill to unlock your first milestone!
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Progress to Next Milestones */}
      <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 2, mt: 4 }}>
        🎯 Progress to Next Milestones
      </Typography>

      <Grid container spacing={2}>
        {user?.skills && Object.entries(user.skills).map(([skillKey, skill]) => {
          const category = skillCategories[skillKey];
          const nextMilestone = Math.ceil(skill.level / 5) * 5;
          const progress = (skill.level / nextMilestone) * 100;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={skillKey}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: category?.color,
                        width: 32,
                        height: 32,
                        mr: 1,
                        fontSize: '14px',
                      }}
                    >
                      {category?.icon}
                    </Avatar>
                    <Typography variant="body1">
                      {category?.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Level {skill.level} → Level {nextMilestone}
                  </Typography>
                  
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(progress, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: category?.color,
                      },
                    }}
                  />
                  
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(progress)}% to next milestone
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Tips */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💡 Achievement Tips
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Reach Level 5, 10, 15, etc. in any skill to unlock milestones
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Write detailed journal entries to level up faster
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Complete daily quests for bonus XP
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Focus on skills that align with your personal goals
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Rewards; 