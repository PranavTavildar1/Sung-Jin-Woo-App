const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Import utilities
const { transcribeAudio, validateAudioFile } = require('./utils/transcription');
const { classifyJournalText, SKILL_CATEGORIES } = require('./utils/classification');
const db = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sung Jin Woo App API',
      version: '1.0.0',
      description: 'A voice journaling app with RPG-style skill leveling',
      contact: {
        name: 'Sung Jin Woo App',
        url: 'https://github.com/yourusername/sung-jin-woo-app'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            skills: { type: 'object' },
            totalXP: { type: 'number' },
            level: { type: 'number' },
            journalEntries: { type: 'array' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        JournalEntry: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            type: { type: 'string', enum: ['text', 'audio'] },
            analysis: { type: 'object' },
            xpEarned: { type: 'number' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        Quest: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            skill: { type: 'string' },
            xpReward: { type: 'number' },
            completed: { type: 'boolean' }
          }
        }
      }
    }
  },
  apis: ['./server.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Skill categories and their descriptions
const SKILL_CATEGORIES_DISPLAY = {
  'communication': {
    name: 'Communication',
    description: 'Speaking, writing, and interpersonal skills',
    color: '#4CAF50'
  },
  'leadership': {
    name: 'Leadership',
    description: 'Team management and decision-making abilities',
    color: '#2196F3'
  },
  'creativity': {
    name: 'Creativity',
    description: 'Innovation, artistic expression, and problem-solving',
    color: '#9C27B0'
  },
  'fitness': {
    name: 'Fitness',
    description: 'Physical health and exercise routines',
    color: '#FF9800'
  },
  'learning': {
    name: 'Learning',
    description: 'Knowledge acquisition and skill development',
    color: '#607D8B'
  },
  'productivity': {
    name: 'Productivity',
    description: 'Time management and task completion',
    color: '#795548'
  },
  'emotional_intelligence': {
    name: 'Emotional Intelligence',
    description: 'Self-awareness and emotional regulation',
    color: '#E91E63'
  },
  'financial': {
    name: 'Financial',
    description: 'Money management and financial planning',
    color: '#4CAF50'
  }
};

// XP required for each level (exponential growth)
const XP_PER_LEVEL = (level) => Math.floor(100 * Math.pow(1.5, level - 1));

// Generate daily quests
function generateDailyQuests(userId) {
  const user = db.getUser(userId);
  if (!user) return [];

  const quests = [];
  const userSkills = Object.keys(user.skills);
  
  // Generate 3 daily quests
  for (let i = 0; i < 3; i++) {
    const skill = userSkills[Math.floor(Math.random() * userSkills.length)];
    const skillData = SKILL_CATEGORIES_DISPLAY[skill];
    
    const questTemplates = {
      'communication': [
        'Have a meaningful conversation with someone new',
        'Practice public speaking for 5 minutes',
        'Write a thoughtful message to a friend'
      ],
      'leadership': [
        'Take initiative on a group project',
        'Mentor someone for 15 minutes',
        'Make a difficult decision and explain your reasoning'
      ],
      'creativity': [
        'Create something artistic (draw, write, compose)',
        'Brainstorm 10 new ideas',
        'Try a new creative hobby'
      ],
      'fitness': [
        'Exercise for 30 minutes',
        'Try a new workout routine',
        'Take a long walk in nature'
      ],
      'learning': [
        'Read for 30 minutes',
        'Learn something new online',
        'Practice a skill you want to improve'
      ],
      'productivity': [
        'Complete 3 important tasks',
        'Organize your workspace',
        'Create a detailed plan for tomorrow'
      ],
      'emotional_intelligence': [
        'Practice mindfulness for 10 minutes',
        'Reflect on your emotions throughout the day',
        'Show empathy to someone in need'
      ],
      'financial': [
        'Review your budget',
        'Research an investment opportunity',
        'Save money on a purchase'
      ]
    };

    const templates = questTemplates[skill] || ['Complete a task related to ' + skillData.name];
    const quest = templates[Math.floor(Math.random() * templates.length)];
    
    quests.push({
      id: uuidv4(),
      title: quest,
      skill: skill,
      xpReward: 50,
      completed: false
    });
  }
  
  return quests;
}

// Analyze journal entry with Hugging Face
async function analyzeJournalEntry(content) {
  try {
    return await classifyJournalText(content);
  } catch (error) {
    console.error('Error analyzing journal entry:', error);
    return {};
  }
}

// API Routes

/**
 * @swagger
 * /api/user/{userId}:
 *   get:
 *     summary: Get or create user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 categories:
 *                   type: object
 *       404:
 *         description: User not found
 */
// Get user profile
app.get('/api/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  let user = db.getUser(userId);
  
  if (!user) {
    // Create new user
    user = db.initializeUser(userId);
  }
  
  res.json({
    user,
    categories: SKILL_CATEGORIES_DISPLAY
  });
});

/**
 * @swagger
 * /api/journal/{userId}:
 *   post:
 *     summary: Submit journal entry (text or audio)
 *     tags: [Journal]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Journal text content
 *               type:
 *                 type: string
 *                 enum: [text, audio]
 *                 default: text
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file (optional)
 *     responses:
 *       200:
 *         description: Journal entry submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entry:
 *                   $ref: '#/components/schemas/JournalEntry'
 *                 analysis:
 *                   type: object
 *                 xpEarned:
 *                   type: number
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 leveledUpSkills:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// Submit journal entry
app.post('/api/journal/:userId', upload.single('audio'), async (req, res) => {
  const { userId } = req.params;
  const { content, type } = req.body;
  
  let user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  try {
    let journalContent = content;
    let entryType = type || 'text';
    
    // Handle audio transcription
    if (req.file) {
      try {
        validateAudioFile(req.file.buffer, req.file.mimetype);
        journalContent = await transcribeAudio(req.file.buffer);
        entryType = 'audio';
      } catch (transcriptionError) {
        return res.status(400).json({ error: transcriptionError.message });
      }
    }
    
    if (!journalContent || journalContent.trim().length < 10) {
      return res.status(400).json({ error: 'Journal entry must be at least 10 characters long' });
    }
    
    // Analyze the content
    const analysis = await analyzeJournalEntry(journalContent);
    
    // Calculate XP based on content length and analysis
    const baseXP = Math.min(100, Math.floor(journalContent.length / 10));
    let totalXP = baseXP;
    
    // Award XP to relevant skills and track level ups
    const skillUpdates = {};
    const leveledUpSkills = [];
    
    Object.entries(analysis).forEach(([skill, confidence]) => {
      if (confidence > 30 && user.skills[skill]) {
        const skillXP = Math.floor((confidence / 100) * baseXP);
        const currentLevel = user.skills[skill].level;
        const currentXP = user.skills[skill].xp + skillXP;
        const xpNeeded = XP_PER_LEVEL(currentLevel);
        
        skillUpdates[skill] = {
          xp: currentXP,
          totalXP: user.skills[skill].totalXP + skillXP
        };
        
        // Check for level up
        if (currentXP >= xpNeeded) {
          skillUpdates[skill].level = currentLevel + 1;
          skillUpdates[skill].xp = currentXP - xpNeeded;
          leveledUpSkills.push(skill);
        }
        
        totalXP += skillXP;
      }
    });
    
    // Update user skills
    if (Object.keys(skillUpdates).length > 0) {
      user = db.updateUserSkills(userId, skillUpdates);
    }
    
    // Update total XP
    user.totalXP += totalXP;
    db.saveUser(userId, user);
    
    // Create journal entry
    const entry = {
      id: uuidv4(),
      content: journalContent,
      type: entryType,
      analysis,
      xpEarned: totalXP,
      timestamp: new Date().toISOString()
    };
    
    db.addJournalEntry(userId, entry);
    
    res.json({
      entry,
      analysis,
      xpEarned: totalXP,
      user,
      leveledUpSkills
    });
    
  } catch (error) {
    console.error('Error processing journal entry:', error);
    res.status(500).json({ error: 'Failed to process journal entry' });
  }
});

/**
 * @swagger
 * /api/quests/{userId}:
 *   get:
 *     summary: Get daily quests for user
 *     tags: [Quests]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Daily quests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                 quests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quest'
 *       404:
 *         description: User not found
 */
// Get daily quests
app.get('/api/quests/:userId', (req, res) => {
  const { userId } = req.params;
  
  let quests = db.getDailyQuests(userId);
  
  if (!quests) {
    // Generate new daily quests
    const newQuests = generateDailyQuests(userId);
    quests = db.saveDailyQuests(userId, newQuests);
  }
  
  res.json(quests);
});

/**
 * @swagger
 * /api/quests/{userId}/complete/{questId}:
 *   post:
 *     summary: Complete a daily quest
 *     tags: [Quests]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: questId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quest ID
 *     responses:
 *       200:
 *         description: Quest completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quest:
 *                   $ref: '#/components/schemas/Quest'
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 leveledUp:
 *                   type: boolean
 *       400:
 *         description: Quest not found or already completed
 *       404:
 *         description: User or quest not found
 *       500:
 *         description: Server error
 */
// Complete quest
app.post('/api/quests/:userId/complete/:questId', (req, res) => {
  const { userId, questId } = req.params;
  
  try {
    const user = db.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const quests = db.getDailyQuests(userId);
    if (!quests) {
      return res.status(404).json({ error: 'No quests found for today' });
    }
    
    const quest = quests.quests.find(q => q.id === questId);
    if (!quest || quest.completed) {
      return res.status(400).json({ error: 'Quest not found or already completed' });
    }
    
    // Mark quest as completed
    db.updateQuestStatus(userId, questId, true);
    
    // Award XP
    const skill = quest.skill;
    if (user.skills[skill]) {
      const currentLevel = user.skills[skill].level;
      const currentXP = user.skills[skill].xp + quest.xpReward;
      const xpNeeded = XP_PER_LEVEL(currentLevel);
      
      const skillUpdates = {
        [skill]: {
          xp: currentXP,
          totalXP: user.skills[skill].totalXP + quest.xpReward
        }
      };
      
      // Check for level up
      if (currentXP >= xpNeeded) {
        skillUpdates[skill].level = currentLevel + 1;
        skillUpdates[skill].xp = currentXP - xpNeeded;
      }
      
      // Update user skills
      db.updateUserSkills(userId, skillUpdates);
      
      // Update total XP
      user.totalXP += quest.xpReward;
      db.saveUser(userId, user);
    }
    
    // Get updated user
    const updatedUser = db.getUser(userId);
    
    res.json({
      quest: { ...quest, completed: true },
      user: updatedUser,
      leveledUp: updatedUser.skills[skill].level > currentLevel
    });
    
  } catch (error) {
    console.error('Error completing quest:', error);
    res.status(500).json({ error: 'Failed to complete quest' });
  }
});

/**
 * @swagger
 * /api/rewards/{userId}:
 *   get:
 *     summary: Get user rewards
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User rewards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rewards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       skill:
 *                         type: string
 *                       level:
 *                         type: number
 *                       reward:
 *                         type: string
 *                       type:
 *                         type: string
 *       404:
 *         description: User not found
 */
// Get rewards
app.get('/api/rewards/:userId', (req, res) => {
  const { userId } = req.params;
  
  const user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const rewards = [];
  Object.entries(user.skills).forEach(([skill, skillData]) => {
    const level = skillData.level;
    
    // Reward every 5 levels
    if (level % 5 === 0) {
      rewards.push({
        skill,
        level,
        reward: `Level ${level} ${SKILL_CATEGORIES_DISPLAY[skill].name} Master!`,
        type: 'milestone'
      });
    }
  });
  
  res.json({ rewards });
});

/**
 * @swagger
 * /api/journal/{userId}:
 *   get:
 *     summary: Get user journal entries
 *     tags: [Journal]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of entries to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of entries to skip
 *     responses:
 *       200:
 *         description: Journal entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JournalEntry'
 *                 total:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 *       404:
 *         description: User not found
 */
// Get user journal entries
app.get('/api/journal/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit = 10, offset = 0 } = req.query;
  
  const user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const entries = user.journalEntries || [];
  const paginatedEntries = entries
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  
  res.json({
    entries: paginatedEntries,
    total: entries.length,
    hasMore: entries.length > parseInt(offset) + parseInt(limit)
  });
});

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalEntries:
 *                   type: integer
 *                 lastQuestReset:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *       500:
 *         description: Server error
 */
// Get system statistics (admin endpoint)
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getSystemStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({ error: 'Failed to get system statistics' });
  }
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Reset daily quests at midnight
cron.schedule('0 0 * * *', () => {
  db.resetDailyQuests();
  console.log('Daily quests reset');
});

// Serve React app (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Sung Jin Woo App server running on port ${PORT}`);
}); 