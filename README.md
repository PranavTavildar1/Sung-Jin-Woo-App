# Sung Jin Woo App - Backend

A voice journaling app with RPG-style skill leveling, built with Node.js and Hugging Face models.

## Features

- **Voice Transcription**: Convert audio recordings to text using Hugging Face's Whisper model
- **NLP Analysis**: Classify journal entries into skill categories using zero-shot classification
- **RPG Skill System**: Level up skills based on journal content analysis
- **Daily Quests**: Generate personalized daily quests for skill development
- **Rewards System**: Unlock rewards every 5 levels in each skill
- **Local Storage**: JSON-based database using lowdb

## Tech Stack

- **Backend**: Node.js, Express
- **AI/ML**: Hugging Face Inference API (Whisper, BART)
- **Database**: lowdb (JSON file storage)
- **Audio Processing**: Multer for file uploads
- **Scheduling**: node-cron for daily quest resets

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Hugging Face API token (free)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your Hugging Face API key:
   ```
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

3. **Get Hugging Face API Key**:
   - Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Create a new token (free tier available)
   - Copy the token to your `.env` file

4. **Start the server**:
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

The server will run on `http://localhost:5000`

## API Endpoints

### User Management
- `GET /api/user/:userId` - Get or create user profile
- `GET /api/health` - Health check

### Journal Entries
- `POST /api/journal/:userId` - Submit journal entry (text or audio)
- `GET /api/journal/:userId` - Get user's journal entries

### Quests
- `GET /api/quests/:userId` - Get daily quests
- `POST /api/quests/:userId/complete/:questId` - Complete a quest

### Rewards
- `GET /api/rewards/:userId` - Get user rewards

### Admin
- `GET /api/stats` - System statistics

## Skill Categories

The app tracks progress in 8 skill categories:

1. **Communication** - Speaking, writing, interpersonal skills
2. **Leadership** - Team management, decision-making
3. **Creativity** - Innovation, artistic expression, problem-solving
4. **Fitness** - Physical health, exercise routines
5. **Learning** - Knowledge acquisition, skill development
6. **Productivity** - Time management, task completion
7. **Emotional Intelligence** - Self-awareness, emotional regulation
8. **Financial** - Money management, financial planning

## How It Works

### 1. Journal Entry Processing
- Users can submit text or audio journal entries
- Audio is transcribed using Hugging Face's Whisper model
- Text is analyzed using zero-shot classification to identify relevant skills
- XP is awarded based on content length and skill relevance

### 2. Skill Leveling
- Each skill starts at level 1
- XP requirements increase exponentially with each level
- Level-ups are tracked and can trigger rewards

### 3. Daily Quests
- 3 quests are generated daily based on user's skills
- Completing quests awards bonus XP
- Quests reset at midnight

### 4. Rewards
- Rewards are unlocked every 5 levels in each skill
- Rewards include badges and milestone achievements

## File Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── env.example           # Environment variables template
├── data/                 # Database storage
│   └── db.json          # User data and quests
├── utils/                # Utility functions
│   ├── transcription.js  # Audio transcription
│   ├── classification.js # Text classification
│   └── database.js      # Database operations
└── README.md            # This file
```

## Development

### Adding New Skills
1. Update `SKILL_CATEGORIES` in `utils/classification.js`
2. Add skill to `initializeUser()` in `utils/database.js`
3. Add quest templates in `generateDailyQuests()` in `server.js`
4. Update `SKILL_CATEGORIES_DISPLAY` in `server.js`

### Customizing XP System
- Modify `XP_PER_LEVEL()` function in `server.js`
- Adjust confidence thresholds in `utils/classification.js`
- Update base XP calculation in journal entry processing

### Database Backup
```javascript
const db = require('./utils/database');
const backup = db.backupDatabase();
// Save backup to file or cloud storage
```

## Free Tier Limitations

- **Hugging Face API**: Rate limits apply (check your plan)
- **Audio Files**: Max 25MB per file
- **Storage**: Local JSON file (no cloud storage)

## Production Considerations

For production deployment:

1. **Database**: Replace lowdb with PostgreSQL/MongoDB
2. **Authentication**: Add user authentication system
3. **File Storage**: Use cloud storage for audio files
4. **Caching**: Add Redis for performance
5. **Monitoring**: Add logging and monitoring
6. **Security**: Add rate limiting and input validation

## Troubleshooting

### Common Issues

1. **Hugging Face API errors**:
   - Check your API key is correct
   - Verify you have sufficient quota
   - Check rate limits

2. **Audio transcription fails**:
   - Ensure audio file is supported format
   - Check file size (max 25MB)
   - Verify audio quality

3. **Database errors**:
   - Check `data/` directory exists
   - Verify file permissions
   - Check JSON file integrity

### Logs
Check console output for detailed error messages and processing logs.

## License

MIT License - feel free to use and modify for your projects! 