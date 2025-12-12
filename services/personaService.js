import fs from 'fs';
import path from 'path';
import { Persona } from '../models/Persona.js';

const rootPath = process.cwd();

const TARGET_FILES = [
  { name: 'Cleopatra', filename: 'persona-responses/cleopatra_advanced.json' },
  {
    name: 'Tutankhamun',
    filename: 'persona-responses/tutankhamun_advanced.json',
  },
  {
    name: 'Ramesses II',
    filename: 'persona-responses/ramesses-ii_advanced.json',
  },
];

const personaCache = {};

/**
 * Loads all persona data from JSON files into memory.
 * Validates each loaded persona against the Persona model.
 * Caches the data in the `personaCache` object.
 * * @throws {Error} If one or more personas failed to load or validate.
 */
export const loadPersonas = () => {
  let hadCriticalFailure = false; // Flag to track if any file failed

  TARGET_FILES.forEach((file) => {
    try {
      const fullPath = path.join(rootPath, file.filename);

      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const parsedData = JSON.parse(content);

        // Validate against Schema
        const personaModel = new Persona(parsedData);
        const validationError = personaModel.validateSync();

        if (validationError) {
          console.error(`❌ Validation failed for ${file.name}:`, validationError.message);
          hadCriticalFailure = true; // Mark as failed
          return; // Skip adding the invalid persona
        }

        personaCache[file.name] = parsedData;
        console.log(`✅ Loaded: ${file.name}`);
      } else {
        console.warn(`⚠️ File not found: ${fullPath}`);
        hadCriticalFailure = true; // Treat missing file as a failure to prevent incomplete data
      }
    } catch (error) {
      console.error(`❌ Error loading ${file.name}:`, error);
      hadCriticalFailure = true; // Mark as failed (JSON parse error, etc.)
    }
  });

  // CRITICAL: Check the flag and throw an error after the loop completes.
  if (hadCriticalFailure) {
    throw new Error("One or more personas failed to load or validate. Server startup halted.");
  }
};

/**
 * Retrieves a persona by name from the cache.
 * @param {string} personaName - The name of the persona to retrieve.
 * @returns {Object|undefined} The persona object or undefined if not found.
 */
export const getPersona = (personaName) => personaCache[personaName];