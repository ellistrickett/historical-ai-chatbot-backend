import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Persona } from '../../../models/Persona.js'; 

// --- MOCK SETUP ---
// 1. Mock fs and path
const mockFs = {
  default: {
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
  },
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
};

jest.unstable_mockModule('fs', () => mockFs);

jest.unstable_mockModule('path', () => ({
  default: {
    join: jest.fn((_, filename) => `/path/to/${filename}`),
  },
  join: jest.fn((_, filename) => `/path/to/${filename}`),
}));

// 2. Mock the Mongoose Model
const mockValidateSync = jest.fn();
const mockPersonaModel = jest.fn().mockImplementation((data) => ({
  ...data,
  validateSync: mockValidateSync, 
}));

jest.unstable_mockModule('../../../models/Persona.js', () => ({
  Persona: mockPersonaModel,
}));

// 3. Dynamic imports
const fs = await import('fs');
// NOTE: Ensure you have exported clearPersonaCache from your service file!
const { loadPersonas, getPersona, clearPersonaCache } = await import(
  '../../../services/personaService.js'
);

const TARGET_FILE_COUNT = 3; 

// Helper to generate valid mock data for specific personas
const createMockData = (name) => ({
  name, 
  role: 'Pharaoh',
  persona: { name, tone: 'Regal' },
  topics: {}, 
  responses: {} 
});

describe('Persona Service: loadPersonas', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // CRITICAL: Clear the persistent cache before every test to prevent state pollution
        if (typeof clearPersonaCache === 'function') {
            clearPersonaCache();
        }

        // Default: All files exist
        fs.default.existsSync.mockReturnValue(true);
        
        // Default: readFileSync returns unique data based on the filename requested
        // This ensures Cleopatra, Tutankhamun, and Ramesses don't overwrite each other
        fs.default.readFileSync.mockImplementation((file) => {
            if (file.includes('cleopatra')) return JSON.stringify(createMockData('Cleopatra'));
            if (file.includes('tutankhamun')) return JSON.stringify(createMockData('Tutankhamun'));
            if (file.includes('ramesses')) return JSON.stringify(createMockData('Ramesses II'));
            return JSON.stringify(createMockData('Generic'));
        });
        
        // Default: Validation always passes
        mockValidateSync.mockReturnValue(null);
        
        // Silence console
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    // --- TESTS ---

    it('loads and caches all 3 valid personas successfully', () => {
        loadPersonas();
        
        // Verify all files were processed
        expect(mockValidateSync).toHaveBeenCalledTimes(TARGET_FILE_COUNT);
        
        // Verify all 3 were cached correctly
        expect(getPersona('Cleopatra')).toBeDefined();
        expect(getPersona('Tutankhamun')).toBeDefined();
        expect(getPersona('Ramesses II')).toBeDefined();
        
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('handles missing files gracefully and THROWS final error', () => {
        // Setup: Cleopatra exists, but the others are missing
        fs.default.existsSync.mockImplementation((path) => {
            return path.includes('cleopatra'); // Only true for Cleopatra
        }); 

        // Act & Assert: Should throw critical error
        expect(() => loadPersonas()).toThrow(
            "One or more personas failed to load or validate. Server startup halted."
        );
        
        // Assert: Cleopatra should have loaded before the loop finished
        expect(getPersona('Cleopatra')).toBeDefined();
        // Tutankhamun should NOT be loaded
        expect(getPersona('Tutankhamun')).toBeUndefined();
    });

    it('skips loading if Mongoose validation fails and THROWS final error', () => {
        // Setup: Fail validation ONLY for the first file (Cleopatra)
        mockValidateSync
            .mockReturnValueOnce({ message: 'Validation failed', errors: {} }) // 1st call fails
            .mockReturnValue(null); // 2nd and 3rd calls pass
        
        // Act & Assert
        expect(() => loadPersonas()).toThrow("One or more personas failed to load or validate");
        
        // Assert: Error logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Validation failed for Cleopatra'),
            expect.any(String)
        );
        
        // Assert Cache State:
        // Cleopatra failed, so she should NOT be in cache.
        expect(getPersona('Cleopatra')).toBeUndefined(); 
        // The loop continued, so Tutankhamun SHOULD be in cache.
        expect(getPersona('Tutankhamun')).toBeDefined();
    });

    it('logs an error if file content is invalid JSON and THROWS final error', () => {
        // Setup: Return broken JSON for Cleopatra only
        fs.default.readFileSync.mockImplementation((path) => {
            if (path.includes('cleopatra')) return '{{ BROKEN JSON ';
            if (path.includes('tutankhamun')) return JSON.stringify(createMockData('Tutankhamun'));
            return JSON.stringify(createMockData('Ramesses II'));
        });

        // Act & Assert
        expect(() => loadPersonas()).toThrow("One or more personas failed to load or validate");

        // Assert: SyntaxError logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error loading Cleopatra'),
            expect.any(SyntaxError)
        );
        
        // Assert Cache State
        expect(getPersona('Cleopatra')).toBeUndefined(); 
        expect(getPersona('Tutankhamun')).toBeDefined();
    });
});