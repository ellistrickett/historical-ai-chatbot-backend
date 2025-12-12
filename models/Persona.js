/**
 * @file Persona.js
 * @description Mongoose model for Personas.
 */
import mongoose from 'mongoose';

/**
 * Schema for a Persona's response options (text and probability).
 */
const responseOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  probability: { type: Number, default: 1 },
});

/**
 * Main Schema for a Persona document.
 */
const personaSchema = new mongoose.Schema({
  // 1. ROOT IDENTIFIERS (Required for easy lookup/validation)
  name: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
  },

  // 2. AI CONTEXT (The nested object)
  persona: {
    name: { type: String, required: true }, // The persona's full name/title
    tone: { type: String, required: true },
    traits: { type: [String] },
    context: String, // Context field, if used
  },

  // 3. KEYWORD TOPICS
  topics: {
    type: Map,
    of: [String], // Key maps to an array of string keywords
  },

  // 4. PRE-WRITTEN RESPONSES (FIXED VALIDATION)
  responses: {
    type: Map,
    of: [responseOptionSchema], // Key maps to an array of Response Option objects
  },

  // 5. DIALOGUE TREES
  dialogueTrees: {
    type: mongoose.Schema.Types.Mixed, // Keeps the complex structure flexible
  },
});

/**
 * Persona Model
 */
export const Persona = mongoose.model('Persona', personaSchema);