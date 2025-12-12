import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Persona } from '../../../models/Persona.js'; // Import the original model for typing/mocking

// --- MOCK SETUP ---
// 1. Mock fs and path (Use vi.mock if you were using Vitest)
jest.unstable_mockModule('fs', () => ({
  // Note: Must match how your production code imports/accesses fs (likely default)
  default: {
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
  },
  existsSync: jest.fn(), // Exported functions for direct import if needed
  readFileSync: jest.fn(),
}));

jest.unstable_mockModule('path', () => ({
  default: {
    join: jest.fn((_, filename) => `/path/to/${filename}`), // Simplified join for easier assertion
  },
  join: jest.fn((_, filename) => `/path/to/${filename}`),
}));

// 2. Mock the Mongoose Model (We must control its behavior per test)
const mockValidateSync = jest.fn();
const mockPersonaModel = jest.fn().mockImplementation((data) => ({
    ...data,
    validateSync: mockValidateSync, // Our controllable spy
}));

jest.unstable_mockModule('../../../models/Persona.js', () => ({
  Persona: mockPersonaModel,
}));

// 3. Dynamic imports (Must be AFTER the mocks)
const fs = await import('fs');
const { loadPersonas, getPersona } = await import(
  '../../../services/personaService.js'
);

// Define the file structure used in your service (to simplify mocking TARGET_FILES)
const TARGET_FILES = [
  { name: 'Cleopatra', filename: 'persona-responses/cleopatra_advanced.json' },
];

describe('Persona Service: loadPersonas', () => {
    let consoleErrorSpy;

    // --- SETUP FIXES ---
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Ensure all files exist by default
        fs.default.existsSync.mockReturnValue(true);
        
        // Silence console logs during tests
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Default Mock Read: A valid persona structure (matching the final schema)
        const mockValidData = { 
            name: 'Cleopatra', 
            role: 'Queen',
            persona: { name: 'Cleopatra VII', tone: 'Regal' },
            topics: {}, 
            responses: {} 
        };
        fs.default.readFileSync.mockReturnValue(JSON.stringify(mockValidData));
        
        // Default Mock Validation: Always passes
        mockValidateSync.mockReturnValue(null);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    // --- TESTS ---

    it('loads and caches a valid persona successfully', () => {
        loadPersonas();
        const persona = getPersona('Cleopatra');

        expect(persona.name).toBe('Cleopatra');
        expect(getPersona('Cleopatra')).toBeDefined();
        expect(mockValidateSync).toHaveBeenCalledTimes(TARGET_FILES.length); // Should call validation
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('handles missing files gracefully', () => {
        fs.default.existsSync.mockReturnValue(false); // Make file appear missing
        
        loadPersonas();

        expect(getPersona('Cleopatra')).toBeUndefined(); // Should not be loaded
        expect(fs.default.readFileSync).not.toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('skips loading if Mongoose validation fails (Catching JSON structure errors)', () => {
        // 1. Setup: Make validation fail for the required 'name' field
        mockValidateSync.mockReturnValue({
            message: 'Persona validation failed: name: Path `name` is required.',
            errors: { name: { message: 'Path `name` is required.' } }
        });

        loadPersonas();

        // 2. Assert: Cache Check (Crucial: Should NOT load)
        expect(getPersona('Cleopatra')).toBeUndefined(); 
        
        // 3. Assert: Error Logging Check (Should log the failure)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('❌ Validation failed for Cleopatra'),
            expect.any(Object)
        );
    });

    it('logs an error if file content is invalid JSON', () => {
        // Setup: Return broken JSON string
        fs.default.readFileSync.mockReturnValue('{"name": "Broken"'); 

        loadPersonas();

        // Assert: The try/catch block should catch the JSON.parse error
        expect(getPersona('Cleopatra')).toBeUndefined();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('❌ Error loading Cleopatra'),
            expect.any(SyntaxError)
        );
    });
});