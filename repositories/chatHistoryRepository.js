import fs from 'fs/promises';
import path from 'path';

const chatsFilePath = path.join(process.cwd(), 'previous-chats.json');

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

export const writeChatsFile = async (chats) => {
  try {
    await fs.writeFile(chatsFilePath, JSON.stringify(chats, null, 2), 'utf-8');
    return true;
  } catch (error) {
    throw new Error('Failed to write to chat history file.');
  }
};
