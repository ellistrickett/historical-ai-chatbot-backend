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
 */
export const loadPersonas = () => {
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
          // We intentionally skip adding invalid personas to the cache
          return;
        }

        personaCache[file.name] = parsedData;
        console.log(`✅ Loaded: ${file.name}`);
      } else {
        console.warn(`⚠️ File not found: ${fullPath}`);
      }
    } catch (error) {
      console.error(`❌ Error loading ${file.name}:`, error);
    }
  });
};

/**
 * Retrieves a persona by name from the cache.
 * @param {string} personaName - The name of the persona to retrieve.
 * @returns {Object|undefined} The persona object or undefined if not found.
 */
export const getPersona = (personaName) => personaCache[personaName];
