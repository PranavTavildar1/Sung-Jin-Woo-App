const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

// Initialize database
const adapter = new FileSync(path.join(__dirname, '../data/db.json'));
const db = low(adapter);

// Set default data structure
db.defaults({
  users: {},
  dailyQuests: {},
  rewards: {},
  system: {
    lastQuestReset: new Date().toISOString(),
    version: '1.0.0'
  }
}).write();

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User object or null if not found
 */
function getUser(userId) {
  return db.get('users').get(userId).value() || null;
}

/**
 * Create or update user
 * @param {string} userId - User ID
 * @param {Object} userData - User data
 * @returns {Object} Updated user object
 */
function saveUser(userId, userData) {
  db.get('users').set(userId, userData).write();
  return userData;
}

/**
 * Initialize new user with default skills
 * @param {string} userId - User ID
 * @returns {Object} New user object
 */
function initializeUser(userId) {
  const skillCategories = [
    'communication', 'leadership', 'creativity', 'fitness',
    'learning', 'productivity', 'emotional_intelligence', 'financial'
  ];
  
  const skills = {};
  skillCategories.forEach(category => {
    skills[category] = {
      level: 1,
      xp: 0,
      totalXP: 0,
      lastLevelUp: new Date().toISOString()
    };
  });
  
  const newUser = {
    id: userId,
    skills,
    totalXP: 0,
    level: 1,
    journalEntries: [],
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  };
  
  return saveUser(userId, newUser);
}

/**
 * Add journal entry to user
 * @param {string} userId - User ID
 * @param {Object} entry - Journal entry object
 * @returns {Object} Updated user object
 */
function addJournalEntry(userId, entry) {
  const user = getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  user.journalEntries.push(entry);
  user.lastActive = new Date().toISOString();
  
  return saveUser(userId, user);
}

/**
 * Update user skills and XP
 * @param {string} userId - User ID
 * @param {Object} skillUpdates - Object with skill updates
 * @returns {Object} Updated user object
 */
function updateUserSkills(userId, skillUpdates) {
  const user = getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update skills
  Object.entries(skillUpdates).forEach(([skill, update]) => {
    if (user.skills[skill]) {
      user.skills[skill] = { ...user.skills[skill], ...update };
      if (update.level > user.skills[skill].level) {
        user.skills[skill].lastLevelUp = new Date().toISOString();
      }
    }
  });
  
  user.lastActive = new Date().toISOString();
  return saveUser(userId, user);
}

/**
 * Get daily quests for user
 * @param {string} userId - User ID
 * @returns {Object} Daily quests object
 */
function getDailyQuests(userId) {
  const quests = db.get('dailyQuests').get(userId).value();
  const today = new Date().toDateString();
  
  if (!quests || quests.date !== today) {
    return null;
  }
  
  return quests;
}

/**
 * Save daily quests for user
 * @param {string} userId - User ID
 * @param {Array} quests - Array of quest objects
 * @returns {Object} Saved quests object
 */
function saveDailyQuests(userId, quests) {
  const questData = {
    date: new Date().toDateString(),
    quests
  };
  
  db.get('dailyQuests').set(userId, questData).write();
  return questData;
}

/**
 * Update quest completion status
 * @param {string} userId - User ID
 * @param {string} questId - Quest ID
 * @param {boolean} completed - Completion status
 * @returns {Object} Updated quests object
 */
function updateQuestStatus(userId, questId, completed) {
  const quests = getDailyQuests(userId);
  if (!quests) {
    throw new Error('No quests found for today');
  }
  
  const quest = quests.quests.find(q => q.id === questId);
  if (!quest) {
    throw new Error('Quest not found');
  }
  
  quest.completed = completed;
  quest.completedAt = completed ? new Date().toISOString() : null;
  
  saveDailyQuests(userId, quests.quests);
  return quests;
}

/**
 * Get user rewards
 * @param {string} userId - User ID
 * @returns {Array} Array of reward objects
 */
function getUserRewards(userId) {
  return db.get('rewards').get(userId).value() || [];
}

/**
 * Add reward to user
 * @param {string} userId - User ID
 * @param {Object} reward - Reward object
 * @returns {Array} Updated rewards array
 */
function addUserReward(userId, reward) {
  const rewards = getUserRewards(userId);
  const newReward = {
    ...reward,
    id: reward.id || require('uuid').v4(),
    earnedAt: new Date().toISOString()
  };
  
  rewards.push(newReward);
  db.get('rewards').set(userId, rewards).write();
  
  return rewards;
}

/**
 * Get all users (for admin purposes)
 * @returns {Object} All users object
 */
function getAllUsers() {
  return db.get('users').value();
}

/**
 * Get system statistics
 * @returns {Object} System statistics
 */
function getSystemStats() {
  const users = getAllUsers();
  const totalUsers = Object.keys(users).length;
  const totalEntries = Object.values(users).reduce((sum, user) => 
    sum + (user.journalEntries ? user.journalEntries.length : 0), 0
  );
  
  return {
    totalUsers,
    totalEntries,
    lastQuestReset: db.get('system.lastQuestReset').value(),
    version: db.get('system.version').value()
  };
}

/**
 * Reset daily quests for all users
 */
function resetDailyQuests() {
  db.set('dailyQuests', {}).write();
  db.set('system.lastQuestReset', new Date().toISOString()).write();
}

/**
 * Backup database
 * @returns {Object} Database backup
 */
function backupDatabase() {
  return db.getState();
}

/**
 * Restore database from backup
 * @param {Object} backup - Database backup object
 */
function restoreDatabase(backup) {
  db.setState(backup).write();
}

module.exports = {
  getUser,
  saveUser,
  initializeUser,
  addJournalEntry,
  updateUserSkills,
  getDailyQuests,
  saveDailyQuests,
  updateQuestStatus,
  getUserRewards,
  addUserReward,
  getAllUsers,
  getSystemStats,
  resetDailyQuests,
  backupDatabase,
  restoreDatabase
}; 