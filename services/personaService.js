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
 * Clears the internal cache. Used primarily for testing.
 */
export const clearPersonaCache = () => {
  // Clear the cache object using Object.keys() to ensure the same object reference is maintained, 
  // which is safer if other modules imported it before it was cleared.
  Object.keys(personaCache).forEach(key => delete personaCache[key]);
};


/**
 * Loads all persona data from JSON files into memory.
 * Validates each loaded persona against the Persona model.
 * Caches the data in the `personaCache` object.
 */
export const loadPersonas = () => {
  let hadCriticalFailure = false;

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
          hadCriticalFailure = true;
          return;
        }

        personaCache[file.name] = parsedData;
        console.log(`✅ Loaded: ${file.name}`);
      } else {
        console.warn(`⚠️ File not found: ${fullPath}`);
        hadCriticalFailure = true;
      }
    } catch (error) {
      console.error(`❌ Error loading ${file.name}:`, error);
      hadCriticalFailure = true;
    }
  });

  // Check the flag and throw an error after the loop completes
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