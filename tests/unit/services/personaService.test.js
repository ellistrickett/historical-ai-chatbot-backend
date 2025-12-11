import { jest } from '@jest/globals';

// 1. Mock fs and path
jest.unstable_mockModule('fs', () => ({
  default: {
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
  },
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.unstable_mockModule('path', () => ({
  default: {
    join: jest.fn(),
  },
}));

// 2. Mock the Mongoose Model to always pass validation
// This isolates the Service logic from the Database rules
jest.unstable_mockModule('../../../models/Persona.js', () => ({
  Persona: class {
    constructor(data) { Object.assign(this, data); }
    validateSync() { return null; } // Return null means "No Validation Error"
  }
}));

// 3. Dynamic imports (Must be AFTER the mocks)
const fs = await import('fs');
const path = await import('path');
const { loadPersonas, getPersona } = await import(
  '../../../services/personaService.js'
);

describe('Persona Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Silence console logs during tests to keep output clean
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('loadPersonas', () => {
    it('loads personas successfully', () => {
      // Setup
      path.default.join.mockReturnValue('/path/to/cleopatra.json');
      fs.default.existsSync.mockReturnValue(true);
      
      const mockData = { name: 'Cleopatra' }; 
      fs.default.readFileSync.mockReturnValue(JSON.stringify(mockData));

      // Act
      loadPersonas();
      const persona = getPersona('Cleopatra');

      // Assert
      expect(persona).toEqual(mockData);
      expect(fs.default.readFileSync).toHaveBeenCalled();
    });

    it('handles missing files gracefully', () => {
      path.default.join.mockReturnValue('/path/to/missing.json');
      fs.default.existsSync.mockReturnValue(false);

      loadPersonas();

      // Should log warning but not throw or try to read
      expect(fs.default.readFileSync).not.toHaveBeenCalled();
    });
  });
});