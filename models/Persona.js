/**
 * @file Persona.js
 * @description Mongoose model for Personas.
 * Defines the structure for persona configuration, including roles, topics, and dialogue trees.
 */
import mongoose from 'mongoose';

/**
 * Schema for a Persona's response options.
 * @type {mongoose.Schema}
 */
const responseOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  probability: { type: Number, default: 1 },
});

/**
 * Schema for a Persona definition.
 * Used for validation and potential future storage of personas in DB.
 * @type {mongoose.Schema}
 */
const personaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
  },
  persona: {
    name: String,
    context: String,
  },
  topics: {
    type: Map,
    of: [String],
  },
  responses: {
    type: Map,
    of: [responseOptionSchema],
  },
  dialogueTrees: {
    type: mongoose.Schema.Types.Mixed,
  },
});

/**
 * Persona Model
 * @type {mongoose.Model}
 */
export const Persona = mongoose.model('Persona', personaSchema);
