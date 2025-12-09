import { jest } from '@jest/globals';

// Mock fs and path
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

// Dynamic imports
const fs = await import('fs');
const path = await import('path');
const { loadPersonas, getPersona } = await import(
  '../../../services/personaService.js'
);

describe('Persona Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  describe('loadPersonas', () => {
    it('loads personas successfully', () => {
      // Configure the default export mocks because the service uses "import fs from 'fs'"
      path.default.join.mockReturnValue('/path/to/cleopatra.json');
      fs.default.existsSync.mockReturnValue(true);
      fs.default.readFileSync.mockReturnValue(
        JSON.stringify({ name: 'Cleopatra' })
      );

      loadPersonas();

      const persona = getPersona('Cleopatra');

      expect(persona).toEqual({ name: 'Cleopatra' });
      expect(fs.default.readFileSync).toHaveBeenCalled();
    });

    it('handles missing files gracefully', () => {
      path.default.join.mockReturnValue('/path/to/missing.json');
      fs.default.existsSync.mockReturnValue(false);

      loadPersonas();

      // Should log warning but not throw
      expect(fs.default.readFileSync).not.toHaveBeenCalled();
    });
  });
});
