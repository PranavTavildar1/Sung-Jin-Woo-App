const { HfInference } = require('@huggingface/inference');

// Initialize Hugging Face inference
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Skill categories for classification
const SKILL_CATEGORIES = [
  'communication',
  'leadership', 
  'creativity',
  'fitness',
  'learning',
  'productivity',
  'emotional_intelligence',
  'financial'
];

// Category descriptions for better classification
const CATEGORY_DESCRIPTIONS = {
  'communication': 'speaking, writing, interpersonal skills, conversation, public speaking',
  'leadership': 'team management, decision making, mentoring, taking initiative, project management',
  'creativity': 'artistic expression, innovation, problem solving, brainstorming, design',
  'fitness': 'exercise, physical health, workout, sports, nutrition, wellness',
  'learning': 'studying, reading, skill development, education, knowledge acquisition',
  'productivity': 'time management, task completion, organization, planning, efficiency',
  'emotional_intelligence': 'self awareness, emotional regulation, empathy, mindfulness, relationships',
  'financial': 'money management, budgeting, investing, saving, financial planning'
};

/**
 * Classify journal text into skill categories using zero-shot classification
 * @param {string} text - Journal entry text
 * @returns {Promise<Object>} Object with skill categories and confidence scores
 */
async function classifyJournalText(text) {
  try {
    console.log('Starting text classification...');
    
    if (!text || text.trim().length < 10) {
      console.log('Text too short for meaningful classification');
      return {};
    }
    
    // Use zero-shot classification with a lightweight model
    const response = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli',
      inputs: text,
      parameters: {
        candidate_labels: SKILL_CATEGORIES,
        hypothesis_template: 'This text is about {}'
      }
    });
    
    console.log('Classification completed');
    
    // Process results and filter by confidence threshold
    const results = {};
    const confidenceThreshold = 0.3; // 30% confidence threshold
    
    response.labels.forEach((label, index) => {
      const confidence = response.scores[index];
      if (confidence >= confidenceThreshold) {
        results[label] = Math.round(confidence * 100);
      }
    });
    
    // If no categories meet threshold, assign to most likely category
    if (Object.keys(results).length === 0 && response.scores.length > 0) {
      const maxIndex = response.scores.indexOf(Math.max(...response.scores));
      results[response.labels[maxIndex]] = Math.round(response.scores[maxIndex] * 100);
    }
    
    return results;
    
  } catch (error) {
    console.error('Error in text classification:', error);
    
    // Fallback: simple keyword-based classification
    return fallbackClassification(text);
  }
}

/**
 * Fallback classification using keyword matching
 * @param {string} text - Journal entry text
 * @returns {Object} Object with skill categories and confidence scores
 */
function fallbackClassification(text) {
  const lowerText = text.toLowerCase();
  const results = {};
  
  // Keyword patterns for each category
  const keywordPatterns = {
    'communication': [
      'talk', 'speak', 'conversation', 'discuss', 'presentation', 'meeting',
      'email', 'message', 'write', 'writing', 'communicate', 'explain'
    ],
    'leadership': [
      'lead', 'manage', 'team', 'project', 'decision', 'mentor', 'guide',
      'initiative', 'responsibility', 'coordinate', 'organize'
    ],
    'creativity': [
      'create', 'design', 'art', 'draw', 'paint', 'write', 'compose',
      'innovate', 'brainstorm', 'idea', 'creative', 'imagine'
    ],
    'fitness': [
      'exercise', 'workout', 'run', 'gym', 'sport', 'train', 'fitness',
      'health', 'nutrition', 'diet', 'strength', 'cardio'
    ],
    'learning': [
      'learn', 'study', 'read', 'research', 'course', 'education',
      'knowledge', 'skill', 'practice', 'understand', 'explore'
    ],
    'productivity': [
      'complete', 'task', 'finish', 'organize', 'plan', 'schedule',
      'efficient', 'productive', 'work', 'focus', 'deadline'
    ],
    'emotional_intelligence': [
      'feel', 'emotion', 'mindful', 'meditate', 'reflect', 'empathy',
      'relationship', 'understand', 'aware', 'calm', 'stress'
    ],
    'financial': [
      'money', 'budget', 'save', 'invest', 'finance', 'expense',
      'income', 'spend', 'cost', 'financial', 'economy'
    ]
  };
  
  // Check each category for keyword matches
  Object.entries(keywordPatterns).forEach(([category, keywords]) => {
    const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matches > 0) {
      // Calculate confidence based on number of matches
      const confidence = Math.min(100, matches * 25);
      results[category] = confidence;
    }
  });
  
  return results;
}

/**
 * Get category description for a given skill
 * @param {string} skill - Skill category name
 * @returns {string} Category description
 */
function getCategoryDescription(skill) {
  return CATEGORY_DESCRIPTIONS[skill] || 'General skill development';
}

/**
 * Validate text for classification
 * @param {string} text - Text to validate
 * @returns {boolean} Whether the text is valid for classification
 */
function validateText(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  const trimmedText = text.trim();
  if (trimmedText.length < 10) {
    return false;
  }
  
  if (trimmedText.length > 5000) {
    return false;
  }
  
  return true;
}

module.exports = {
  classifyJournalText,
  fallbackClassification,
  getCategoryDescription,
  validateText,
  SKILL_CATEGORIES,
  CATEGORY_DESCRIPTIONS
}; 