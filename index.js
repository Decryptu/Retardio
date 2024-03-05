import { Client, GatewayIntentBits, Collection } from 'discord.js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleMessage } from './logic/messageHandler.js';

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: ['CHANNEL'], // Needed for DM support
});

client.commands = new Collection();
global.botActive = true; // Bot is active by default
const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Correctly resolve paths for ES Modules

async function loadCommands() {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const module = await import(`./commands/${file}`);
    const command = module.default; // Adjusted for ES module export
    client.commands.set(command.data.name, command);
  }
}

async function loadEvents() {
  const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const module = await import(`./events/${file}`);
    const event = module.default; // Correcting the import structure
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

// Interaction handler for slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

async function initializeBot() {
    await loadCommands();
    await loadEvents();
    client.on('messageCreate', handleMessage); // This is the correct place.
    client.login(process.env.DISCORD_TOKEN);
}  

initializeBot();

let isShuttingDown = false;

async function gracefulShutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('Shutting down gracefully...');
  try {
    await client.destroy();
    console.log('Bot logged out from Discord');
  } catch (error) {
    console.error('Error during Discord client shutdown:', error);
  }
  process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
