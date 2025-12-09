import fs from 'fs';
import path from 'path';

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

export const loadPersonas = () => {
  TARGET_FILES.forEach((file) => {
    try {
      const fullPath = path.join(rootPath, file.filename);

      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        personaCache[file.name] = JSON.parse(content);
        console.log(`✅ Loaded: ${file.name}`);
      } else {
        console.warn(`⚠️ File not found: ${fullPath}`);
      }
    } catch (error) {
      console.error(`❌ Error loading ${file.name}:`, error);
    }
  });
};

export const getPersona = (personaName) => personaCache[personaName];
