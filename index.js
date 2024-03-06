import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
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
global.botActive = true; // Scanner is active by default
global.degenActive = true; // Degen is active by default
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

async function deleteCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('Started refreshing application (/) commands.');
    
    const commands = await rest.get(Routes.applicationCommands(client.user.id));
    const commandsToDelete = commands.filter(command => ['on', 'off'].includes(command.name));

    for (const command of commandsToDelete) {
      await rest.delete(Routes.applicationCommand(client.user.id, command.id));
      console.log(`Deleted command: ${command.name}`);
    }

    console.log('Successfully deleted specified commands.');
  } catch (error) {
    console.error(error);
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
    client.once('ready', deleteCommands); // Ensure deleteCommands runs after the bot is fully ready
    client.on('messageCreate', handleMessage);
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
