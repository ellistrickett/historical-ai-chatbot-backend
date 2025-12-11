import fs from 'fs/promises';
import path from 'path';

const chatsFilePath = path.join(process.cwd(), 'previous-chats.json');

/**
 * Reads the chat history from the JSON file.
 * Handles missing files (returns empty array) and corrupt JSON (backups and resets).
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of chat sessions.
 * @throws {Error} If a filesystem error occurs other than ENOENT or corruption.
 */
export const readChatsFile = async () => {
  try {
    const data = await fs.readFile(chatsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 1. File doesn't exist yet (Normal first-run behavior)
    if (error.code === 'ENOENT') {
      return [];
    }
    
    // 2. File exists but JSON is corrupt
    if (error instanceof SyntaxError) {
      console.error('CRITICAL: previous-chats.json is corrupt. Backing up and resetting.');
      // Backup the corrupt file
      await fs.rename(chatsFilePath, `${chatsFilePath}.corrupt-${Date.now()}`);
      return [];
    }

    // 3. Actual disk/permission error
    throw new Error(`Failed to read chat history: ${error.message}`);
  }
};

/**
 * Writes the chat history to the JSON file atomically.
 * Writes to a temporary file first, then renames it to ensure data integrity.
 * 
 * @param {Array} chats - The array of chat sessions to write.
 * @returns {Promise<boolean>} A promise that resolves to true if successful.
 * @throws {Error} If writing to the file fails.
 */
export const writeChatsFile = async (chats) => {
  const tempPath = `${chatsFilePath}.tmp`;

  try {
    // 1. Write to a temporary file first
    await fs.writeFile(tempPath, JSON.stringify(chats, null, 2), 'utf-8');

    // 2. Rename temp file to actual file (Atomic operation)
    await fs.rename(tempPath, chatsFilePath);
    
    return true;
  } catch (error) {
    // Clean up temp file if it exists
    try { await fs.unlink(tempPath); } catch (e) {} 
    
    throw new Error(`Failed to write chat history: ${error.message}`);
  }
};