import { jest } from '@jest/globals';

// 1. Mock fs/promises
jest.unstable_mockModule('fs/promises', () => ({
  default: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    rename: jest.fn(),
    unlink: jest.fn(),
  },
}));

// 2. Mock the Chat Model
// We allow dynamic behavior based on the mocked implementation
const mockChatInstance = {
  validateSync: jest.fn(),
};

jest.unstable_mockModule('../../../models/Chat.js', () => ({
  Chat: jest.fn(() => mockChatInstance),
}));

// 3. Dynamic Import
const fs = await import('fs/promises');
const { readChatsFile, writeChatsFile } = await import(
  '../../../repositories/chatHistoryRepository.js'
);

describe('ChatHistoryRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: Log silence
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('readChatsFile', () => {
    it('should return parsed data when file exists', async () => {
      const mockData = [{ id: '1', title: 'Test' }];
      fs.default.readFile.mockResolvedValue(JSON.stringify(mockData));

      const result = await readChatsFile();
      expect(result).toEqual(mockData);
    });

    it('should return empty array if file does not exist (ENOENT)', async () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      fs.default.readFile.mockRejectedValue(error);

      const result = await readChatsFile();
      expect(result).toEqual([]);
    });

    it('should backup and return empty array on corrupt JSON', async () => {
      const syntaxError = new SyntaxError('Unexpected token');
      fs.default.readFile.mockRejectedValue(syntaxError);

      const result = await readChatsFile();

      expect(result).toEqual([]);
      expect(fs.default.rename).toHaveBeenCalled(); // Should assume backup logic
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw on other file system errors', async () => {
      const error = new Error('Permission denied');
      fs.default.readFile.mockRejectedValue(error);

      await expect(readChatsFile()).rejects.toThrow('Failed to read chat history');
    });
  });

  describe('writeChatsFile', () => {
    const validChats = [{ id: '1', title: 'Valid Chat' }];

    it('should write successfully when chats are valid', async () => {
      // Setup validation to pass
      mockChatInstance.validateSync.mockReturnValue(null);

      const result = await writeChatsFile(validChats);

      expect(result).toBe(true);
      expect(fs.default.writeFile).toHaveBeenCalled(); // Writes tmp
      expect(fs.default.rename).toHaveBeenCalled(); // Renames to final
    });

    it('should throw validation error if Chat model fails', async () => {
      // Setup validation to fail
      mockChatInstance.validateSync.mockReturnValue(new Error('Invalid field'));

      await expect(writeChatsFile(validChats)).rejects.toThrow(
        'Validation failed'
      );
      
      expect(fs.default.writeFile).not.toHaveBeenCalled(); // Should not even try to write
    });

    it('should clean up temp file if writing fails', async () => {
        mockChatInstance.validateSync.mockReturnValue(null);
        fs.default.writeFile.mockRejectedValue(new Error('Disk full'));

        await expect(writeChatsFile(validChats)).rejects.toThrow('Failed to write chat history');
        
        expect(fs.default.unlink).toHaveBeenCalled(); // Attempt cleanup
    });
  });
});
