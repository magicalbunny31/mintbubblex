/**
 * MintBubblex 🍭
 *
 * magicalbunny31 : 2022 - 2023
 * https://nuzzles.dev
 */


// utilities for interacting with fennec 💻
import { Client } from "@magicalbunny31/fennec-utilities";


// filesystem
import fs from "fs/promises";


// load .env
import dotenv from "dotenv";
dotenv.config();


// discord client
import Discord from "discord.js";
const client = new Discord.Client({
   presence: {
      activities: [{
         name: `over the crew`,
         type: Discord.ActivityType.Watching
      }]
   },

   intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMembers,
      Discord.GatewayIntentBits.GuildMessages
   ]
});


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
   supportGuild: process.env.SUPPORT_GUILD,
   threadId: process.env.FENNEC_THREAD,
   webhook: {
      url: process.env.FENNEC_WEBHOOK
   }
});

client.fennec.updater(client);

client.blacklist = await client.fennec.getGlobalBlacklist();
setInterval(async () => client.blacklist = await client.fennec.getGlobalBlacklist(), 3.6e+6);


// set application commands
const commands = [];

for (const file of await fs.readdir(`./interactions/chat-input`))
   commands.push((await import(`./interactions/chat-input/${file}`)).data);

await client.application.commands.set(commands, process.env.GUILD_FOXIE);


// listen to events
const events = await fs.readdir(`./events`);
for (const file of events) {
   const event = await import(`./events/${file}`);
   if (!event.once) client.on  (event.name, (...args) => event.default(...args));
   else             client.once(event.name, (...args) => event.default(...args));
};


// statuses
setInterval(async () => {
   // offline-soon or maintenance
   const fennecStatus = await client.fennec.getStatus();
   if ([ `offline-soon`, `maintenance` ].includes(fennecStatus))
      return client.user.setPresence({
         status: Discord.PresenceUpdateStatus.DoNotDisturb,
         activities: [{
            name:  `${fennecStatus === `offline-soon` ? `i'll be offline soon~` : `currently in maintenance!`} 🔧`,
            // state: `${fennecStatus === `offline-soon` ? `i'll be offline soon~` : `currently in maintenance!`} 🔧`,
            // type:  Discord.ActivityType.Custom
            type: Discord.ActivityType.Playing
         }]
      });

   // normal statuses
   client.user.setPresence({
      status: Discord.PresenceUpdateStatus.Online,
      activities: [{
         type: Discord.ActivityType.Watching,
         name: `over the crew`
      }]
   });
}, 1.8e+6); // 30 minutes


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


// log to console once everything is done
console.log(`@${client.user.username} 🍭 is ready~`);