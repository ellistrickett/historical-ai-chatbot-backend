import fs from 'fs/promises';
import path from 'path';

const chatsFilePath = path.join(process.cwd(), 'previous-chats.json');

/**
 * Reads the chat history from the JSON file.
 * @returns {Promise<Array>} A promise that resolves to an array of chat sessions.
 * @throws {Error} If the file cannot be accessed (except ENOENT).
 */
export const readChatsFile = async () => {
  try {
    await fs.access(chatsFilePath);
    const data = await fs.readFile(chatsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw new Error('Could not access chat history file.');
  }
};

/**
 * Writes the chat history to the JSON file.
 * @param {Array} chats - The array of chat sessions to write.
 * @returns {Promise<boolean>} A promise that resolves to true if successful.
 * @throws {Error} If writing to the file fails.
 */
export const writeChatsFile = async (chats) => {
  try {
    await fs.writeFile(chatsFilePath, JSON.stringify(chats, null, 2), 'utf-8');
    return true;
  } catch (error) {
    throw new Error('Failed to write to chat history file.');
  }
};
