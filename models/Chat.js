/**
 * @file Chat.js
 * @description Mongoose model for chat sessions.
 * Defines the structure for storing chat history including messages, persona context, and dialogue tree state.
 */
import mongoose from 'mongoose';

/**
 * Schema for a single message within a chat.
 * @type {mongoose.Schema}
 */
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Schema for a chat session.
 * Corresponds to the structure currently saved in previous-chats.json.
 * @type {mongoose.Schema}
 */
const chatSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  personaName: {
    type: String,
    required: true,
  },
  messages: [messageSchema],
  dialogueTree: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: 'ai_fallback',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying by date
chatSchema.index({ date: -1 });

/**
 * Chat Model
 * @type {mongoose.Model}
 */
export const Chat = mongoose.model('Chat', chatSchema);
