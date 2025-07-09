import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  Book as JournalIcon,
  Psychology as SkillsIcon,
  Assignment as QuestsIcon,
  EmojiEvents as RewardsIcon,
} from '@mui/icons-material';
import { skillCategories } from '../utils/userUtils';

const Header = ({ userId, user, setUser }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <HomeIcon /> },
    { path: '/journal', label: 'Journal', icon: <JournalIcon /> },
    { path: '/skills', label: 'Skills', icon: <SkillsIcon /> },
    { path: '/quests', label: 'Quests', icon: <QuestsIcon /> },
    { path: '/rewards', label: 'Rewards', icon: <RewardsIcon /> },
  ];

  const getTotalLevel = () => {
    if (!user?.skills) return 0;
    return Object.values(user.skills).reduce((total, skill) => total + skill.level, 0);
  };

  const getHighestSkill = () => {
    if (!user?.skills) return null;
    return Object.entries(user.skills).reduce((highest, [key, skill]) => {
      return skill.level > highest.level ? { key, ...skill } : highest;
    }, { level: 0 });
  };

  const highestSkill = getHighestSkill();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 0, 
            mr: 4,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
          }}
        >
          ⚔️ Sung Jin Woo App
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              startIcon={item.icon}
              sx={{
                color: location.pathname === item.path ? '#667eea' : 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Total Level: {getTotalLevel()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total XP: {user.totalXP || 0}
              </Typography>
            </Box>
            
            {highestSkill && (
              <Chip
                avatar={
                  <Avatar sx={{ 
                    bgcolor: skillCategories[highestSkill.key]?.color,
                    fontSize: '12px'
                  }}>
                    {skillCategories[highestSkill.key]?.icon}
                  </Avatar>
                }
                label={`${skillCategories[highestSkill.key]?.name} Lv.${highestSkill.level}`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              />
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 