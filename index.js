/**
 * MintBubblex 🍭
 *
 * magicalbunny31 : 2022 - 2023
 * https://nuzzles.dev
 */


// utilities for interacting with fennec 💻
import { Client } from "@magicalbunny31/fennec-utilities";


// filesystem
import { readdir } from "fs/promises";


// load .env
import dotenv from "dotenv";
dotenv.config();


// discord client
import Discord from "discord.js";
const client = new Discord.Client({
   presence: {
      activities: [{
         type: Discord.ActivityType.Watching,
         name: `over the crew`
      }]
   },

   intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMembers,
      Discord.GatewayIntentBits.GuildMessages
   ]
});


// listen to events
const events = await readdir(`./events`);
for (const file of events) {
   const event = await import(`./events/${file}`);
   if (!event.once) client.on  (event.name, (...args) => event.default(...args));
   else             client.once(event.name, (...args) => event.default(...args));
};


// log in to discord
await client.login(process.env.TOKEN);


// set-up fennec-utilities
const fennecGuild = await client.guilds.fetch(process.env.GUILD_BOT_LOGS);
const fennecMember = await fennecGuild.members.fetch(client.user);

client.fennec = new Client({
   avatarURL: client.user.avatarURL({
      extension: `png`,
      size: 4096
   }),
   colour: Discord.Colors.Blue,
   formattedName: fennecMember.displayName,
   firestore: {
      clientEmail: process.env.FENNEC_GCP_CLIENT_EMAIL,
      privateKey:  process.env.FENNEC_GCP_PRIVATE_KEY,
      projectId:   process.env.FENNEC_GCP_PROJECT_ID
   },
   id: process.env.FENNEC_ID,
   threadId: process.env.FENNEC_THREAD,
   webhook: {
      url: process.env.FENNEC_WEBHOOK
   }
});

client.fennec.updater(client);

client.blacklist = await client.fennec.getGlobalBlacklist();
setInterval(async () => client.blacklist = await client.fennec.getGlobalBlacklist(), 3.6e+6);


// an uncaughtException occurred, send/log it before quitting
process.on("uncaughtException", async (error, origin) => {
   try {
      return await client.fennec.sendError(error, Math.floor(Date.now() / 1000), origin);

   } finally {
      console.warn(`error in uncaught exception! see below~`);
      console.error(error.stack);
      return process.exit(1);
   };
});