// logic/messageHandler.js
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Correctly resolve paths for ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../config.json');
const config = JSON.parse(readFileSync(configPath));

export function handleMessage(message) {
  // Ignore messages from bots or if the bot is turned off
  if (message.author.bot || !global.botActive) return;

  // Check if the message is in an authorized channel
  if (message.channelId === config.channelId) {
    // Log all messages in the authorized channel for debugging
    console.log(`${message.author.tag}: ${message.content}`);

    // Respond to "ping" messages with "pong"
    if (message.content.toLowerCase() === 'ping') {
      message.reply('Pong!')
        .then(() => console.log('Replied with "Pong!"')) // Log successful replies
        .catch(console.error); // Log any errors during reply
    }
  }
}
