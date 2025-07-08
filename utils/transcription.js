const { HfInference } = require('@huggingface/inference');
const fs = require('fs');
const path = require('path');

// Initialize Hugging Face inference
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Cache for the model to avoid reloading
let whisperModel = null;

/**
 * Transcribe audio using Hugging Face's Whisper model
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} audioFormat - Audio format (wav, mp3, etc.)
 * @returns {Promise<string>} Transcribed text
 */
async function transcribeAudio(audioBuffer, audioFormat = 'wav') {
  try {
    console.log('Starting audio transcription...');
    
    // Use Hugging Face's Whisper model
    // We'll use the free API endpoint for MVP
    const response = await hf.audioTranscription({
      model: 'openai/whisper-base',
      data: audioBuffer,
      parameters: {
        language: 'en',
        task: 'transcribe'
      }
    });
    
    console.log('Transcription completed');
    return response.text;
    
  } catch (error) {
    console.error('Error in transcription:', error);
    
    // Fallback: try with a different model or return error
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      throw new Error('Transcription service temporarily unavailable. Please try again later or use text input.');
    }
    
    throw new Error('Failed to transcribe audio. Please check your audio file and try again.');
  }
}

/**
 * Validate audio file
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} mimeType - MIME type of the audio file
 * @returns {boolean} Whether the audio file is valid
 */
function validateAudioFile(audioBuffer, mimeType) {
  // Check file size (max 25MB for free tier)
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (audioBuffer.length > maxSize) {
    throw new Error('Audio file too large. Maximum size is 25MB.');
  }
  
  // Check supported formats
  const supportedFormats = [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg',
    'audio/webm',
    'audio/m4a'
  ];
  
  if (!supportedFormats.includes(mimeType)) {
    throw new Error('Unsupported audio format. Please use WAV, MP3, OGG, WebM, or M4A.');
  }
  
  return true;
}

/**
 * Convert audio buffer to base64 for API
 * @param {Buffer} audioBuffer - Audio file buffer
 * @returns {string} Base64 encoded audio
 */
function audioBufferToBase64(audioBuffer) {
  return audioBuffer.toString('base64');
}

module.exports = {
  transcribeAudio,
  validateAudioFile,
  audioBufferToBase64
}; 