const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv');
const troopsToAp = require('./troopsToAp'); // Import the new module

// Load environment variables from .env file
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

// Load JSON data
let data = { 'City Level': { 'City Wall': [] } }; // Default fallback data
try {
    const fileContent = fs.readFileSync('data.json', 'utf8');
    data = JSON.parse(fileContent);
} catch (error) {
    console.error('Error reading data.json:', error);
    console.warn('Continuing with default/empty data.');
}

const allowedChannelIds = ['1287464937974792403','1280094631698235424'];
const prefix = '!'; // Define the prefix

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    console.log(`Received message: "${message.content}" in channel ${message.channel.id}`);
    
    if (message.author.bot) return;
    if (!allowedChannelIds.includes(message.channel.id)) return;

    // Check if the message starts with the prefix
    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length).trim().toLowerCase();

    try {
        const response = await processMessage(content, message.author);
        await message.reply(response);
    } catch (error) {
        console.error('Error processing message:', error);
        await message.reply('Invalid format. Please send a value followed by a unit (M, G, T, or P) and "AP" or "troops unit percentage%".');
    }
});

async function processMessage(content, author) {
    // Check for the new format: ! 7G 700% -1
    const troopsMatch = content.match(/^(\d+(\.\d+)?)\s*([mgtp])\s*(\d+(\.\d+)?)\s*%(\s*-\d+)?$/i);

    if (troopsMatch) {
        let [, troopsValue, , troopsUnit, strikerPercentage, , levelOffset] = troopsMatch;
        troopsValue = parseFloat(troopsValue);
        strikerPercentage = parseFloat(strikerPercentage);
        troopsUnit = troopsUnit.toUpperCase();
        levelOffset = levelOffset ? parseInt(levelOffset.trim()) : 0; // Changed this line
    
        console.log(`Parsed troopsValue: ${troopsValue}, troopsUnit: ${troopsUnit}, strikerPercentage: ${strikerPercentage}, levelOffset: ${levelOffset}`);
    
        // Calculate AP using the troopsToAp module
        const ap = troopsToAp({ value: troopsValue, unit: troopsUnit }, strikerPercentage);

        console.log(`Calculated AP: ${ap}`);

        // Filter city wall data to only include values <= calculated AP
        const filteredCityWallData = data['City Level']['City Wall'].filter(city => city.value <= ap);

        if (filteredCityWallData.length === 0) {
            return `No city wall data found for your input. Please try a different value. ${author.toString()}`;
        }

        // Find the highest city level from the filtered data
    const cityWallData = filteredCityWallData.reduce((prev, curr) => 
        curr.value > prev.value ? curr : prev
    );

    console.log(`Highest city level: ${cityWallData.level}`);

    // Apply the level offset (fix this line)
    const targetLevel = cityWallData.level + levelOffset; // Changed from - to +

    console.log(`Target level after offset: ${targetLevel}`);

    const targetCityWallData = data['City Level']['City Wall'].find(city => city.level === targetLevel);

        if (!targetCityWallData) {
            return `No city wall data found for the specified level offset. ${author.toString()}`;
        }

        // Convert response to the original unit
        const { responseValue, responseUnit } = troopsToAp.convertFromM(targetCityWallData.value, troopsUnit);

        return `City Level: ${targetCityWallData.level}, City Wall: ${responseValue.toFixed(3)}${responseUnit} ${author.toString()}`;
    }

    // Handle the old format: ! 25T AP, 25 AP is attack power
    const apMatch = content.match(/^(\d+(\.\d+)?)\s*([mgtp])\s*ap(\s*-\d+)?$/i);

    if (apMatch) {
        let [, value, , unit, levelOffset] = apMatch;
        value = parseFloat(value);
        unit = unit.toUpperCase();
        levelOffset = levelOffset ? parseInt(levelOffset.trim().slice(1)) : 0; // Extract and parse the level offset

        console.log(`Parsed value: ${value}, unit: ${unit}, levelOffset: ${levelOffset}`);

        // Convert input to M
        const valueInM = troopsToAp.convertToM(value, unit);

        console.log(`Value in M: ${valueInM}`);

        // Filter city wall data to only include values <= input value
        const filteredCityWallData = data['City Level']['City Wall'].filter(city => city.value <= valueInM);

        if (filteredCityWallData.length === 0) {
            return `No city wall data found for your input. Please try a different value. ${author.toString()}`;
        }

        // Find the highest city level from the filtered data
        const cityWallData = filteredCityWallData.reduce((prev, curr) => 
            curr.value > prev.value ? curr : prev
        );

        console.log(`Highest city level: ${cityWallData.level}`);

        // Apply the level offset
        const targetLevel = cityWallData.level - levelOffset;

        console.log(`Target level after offset: ${targetLevel}`);

        const targetCityWallData = data['City Level']['City Wall'].find(city => city.level === targetLevel);

        if (!targetCityWallData) {
            return `No city wall data found for the specified level offset. ${author.toString()}`;
        }

        // Convert response to the original unit
        const { responseValue, responseUnit } = troopsToAp.convertFromM(targetCityWallData.value, unit);

        return `City Level: ${targetCityWallData.level}, City Wall: ${responseValue.toFixed(3)}${responseUnit} ${author.toString()}`;
    }

    throw new Error('Invalid format');
}

client.login(process.env.BOT_TOKEN)
    .then(() => console.log('Bot logged in successfully'))
    .catch(error => console.error('Error logging in:', error));