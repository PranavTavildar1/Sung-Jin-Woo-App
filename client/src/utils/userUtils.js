import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Generate a random user ID
export const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9);
};

// API service functions
export const apiService = {
  // Get or create user
  async getUser(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Submit journal entry
  async submitJournal(userId, content, type = 'text', audioFile = null) {
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', type);
      
      if (audioFile) {
        formData.append('audio', audioFile);
      }

      const response = await axios.post(`${API_BASE_URL}/journal/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting journal:', error);
      throw error;
    }
  },

  // Get daily quests
  async getQuests(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/quests/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quests:', error);
      throw error;
    }
  },

  // Complete quest
  async completeQuest(userId, questId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/quests/${userId}/complete/${questId}`);
      return response.data;
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  },

  // Get rewards
  async getRewards(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/rewards/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }
  },

  // Get journal entries
  async getJournalEntries(userId, limit = 10, offset = 0) {
    try {
      const response = await axios.get(`${API_BASE_URL}/journal/${userId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  },
};

// Skill categories with colors
export const skillCategories = {
  communication: {
    name: 'Communication',
    color: '#4CAF50',
    icon: '💬',
  },
  leadership: {
    name: 'Leadership',
    color: '#2196F3',
    icon: '👑',
  },
  creativity: {
    name: 'Creativity',
    color: '#9C27B0',
    icon: '🎨',
  },
  fitness: {
    name: 'Fitness',
    color: '#FF9800',
    icon: '💪',
  },
  learning: {
    name: 'Learning',
    color: '#607D8B',
    icon: '📚',
  },
  productivity: {
    name: 'Productivity',
    color: '#795548',
    icon: '⚡',
  },
  emotional_intelligence: {
    name: 'Emotional Intelligence',
    color: '#E91E63',
    icon: '🧠',
  },
  financial: {
    name: 'Financial',
    color: '#4CAF50',
    icon: '💰',
  },
};

// Calculate XP needed for next level
export const calculateXPForLevel = (level) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Calculate progress percentage
export const calculateProgress = (currentXP, level) => {
  const xpForCurrentLevel = calculateXPForLevel(level);
  const xpForNextLevel = calculateXPForLevel(level + 1);
  const xpInCurrentLevel = currentXP;
  const totalXPInLevel = xpForNextLevel - xpForCurrentLevel;
  
  return Math.min(100, (xpInCurrentLevel / totalXPInLevel) * 100);
}; 