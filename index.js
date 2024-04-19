/**
 * MintBubblex 🍭
 *
 * magicalbunny31 : 2022 - 2023
 * https://nuzzles.dev
 */


// some awesome utilities that i pretty much need or else my code will suck 🐾
import { noop } from "@magicalbunny31/awesome-utility-stuff";


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
const fennecGuild = await client.guilds.fetch(process.env.GUILD_APPLICATION_STATUS);
const fennecMember = await fennecGuild.members.fetch(client.user);

client.fennec = new Client({
   firestore: {
      clientEmail:  process.env.FENNEC_GCP_CLIENT_EMAIL,
      documentName: process.env.FENNEC_ID,
      privateKey:   process.env.FENNEC_GCP_PRIVATE_KEY,
      projectId:    process.env.FENNEC_GCP_PROJECT_ID
   },
   postSettings: {
      displayedAvatar: client.user.avatarURL({
         extension: `png`,
         size:      4096
      }),
      displayedName:   fennecMember.displayName,
      embedColour:     Discord.Colors.Blue,
      threadId:        process.env.FENNEC_THREAD
   },
   supportGuild: process.env.SUPPORT_GUILD
});

client.blacklist = await client.fennec.getGlobalBlacklist();


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


// watch schedules
import { scheduleJob } from "node-schedule";

const schedules = await fs.readdir(`./schedules`);
for (const file of schedules) {
   const schedule = await import(`./schedules/${file}`);
   const job = scheduleJob(schedule.cron, async () => await schedule.default(client));

   job.on(`error`, async error => {
      try {
         await client.fennec.sendError(error, Math.floor(Date.now() / 1000), `job/${file}`);

      } catch {
         noop;

      } finally {
         console.warn(`error in schedule! see below~`);
         console.error(error.stack);
         process.exit(1);
      };
   });
};


// process events
process.on("uncaughtException", async (error, origin) => {
   try {
      return await client.fennec.sendError(error, Math.floor(Date.now() / 1000), origin);

   } catch {
      noop;

   } finally {
      console.warn(`error in uncaught exception! see below~`);
      console.error(error.stack);
      process.exit(1);
   };
});


// log to console once everything is done
console.log(`@${client.user.username} 🍭 is ready~`);