import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Send as SendIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { apiService, skillCategories } from '../utils/userUtils';

const Journal = ({ userId, user, setUser }) => {
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);

  useEffect(() => {
    loadRecentEntries();
  }, [userId]);

  const loadRecentEntries = async () => {
    try {
      const entriesData = await apiService.getJournalEntries(userId, 5);
      setRecentEntries(entriesData.entries || []);
    } catch (error) {
      console.error('Error loading recent entries:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setAudioChunks(chunks);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setMessage({ type: 'info', text: 'Recording... Click stop when done.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not access microphone. Please check permissions.' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMessage({ type: 'success', text: 'Recording stopped. Processing audio...' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && audioChunks.length === 0) {
      setMessage({ type: 'error', text: 'Please enter some text or record audio.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let audioFile = null;
      if (audioChunks.length > 0) {
        audioFile = new Blob(audioChunks, { type: 'audio/wav' });
      }

      const response = await apiService.submitJournal(
        userId,
        content,
        audioFile ? 'audio' : 'text',
        audioFile
      );

      setContent('');
      setAudioChunks([]);
      setUser(response.user);
      
      if (response.leveledUpSkills && response.leveledUpSkills.length > 0) {
        setMessage({ 
          type: 'success', 
          text: `🎉 Level up! Skills improved: ${response.leveledUpSkills.join(', ')}` 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: `✅ Journal entry submitted! +${response.xpEarned} XP earned.` 
        });
      }

      // Reload recent entries
      await loadRecentEntries();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit journal entry. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
        📝 Journal Entry
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Share Your Thoughts
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  placeholder="Write about your day, goals, challenges, or anything on your mind..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                  sx={{ mb: 2 }}
                />

                <Box display="flex" gap={2} alignItems="center">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || (!content.trim() && audioChunks.length === 0)}
                    startIcon={<SendIcon />}
                    sx={{ minWidth: 120 }}
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={loading}
                    startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                    color={isRecording ? 'error' : 'primary'}
                  >
                    {isRecording ? 'Stop Recording' : 'Record Audio'}
                  </Button>

                  {audioChunks.length > 0 && (
                    <Chip
                      icon={<VolumeUpIcon />}
                      label="Audio recorded"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </form>

              {loading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Processing your entry...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Writing Tips
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Reflect on your day and experiences
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Write about challenges you faced
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Share your goals and progress
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Describe skills you practiced
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • The more detailed, the more XP you'll earn!
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {recentEntries.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📖 Recent Entries
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
                      {entry.content}
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

export default Journal; 