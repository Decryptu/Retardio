import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import dotenv from 'dotenv/config';
import fs from 'fs';

// Initialize Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [
        'CHANNEL', // Needed for DM support
    ],
});

client.commands = new Collection();
const commands = [];

// Dynamically loading command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = import(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

// Dynamically loading event files
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    import(`./events/${file}`).then(eventModule => {
        const event = eventModule.default;
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    });
}

// Graceful Shutdown Function
let isShuttingDown = false;

async function gracefulShutdown() {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('Shutting down gracefully...');

    // Shut down the Discord client
    try {
        await client.destroy();
        console.log('Bot logged out from Discord');
    } catch (error) {
        console.error('Error during Discord client shutdown:', error);
    }

    // Exit the process
    process.exit(0);
}

// Signal handling for graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
