/**
 * MintBubblex 🍭
 *
 * magicalbunny31 : 2022
 * https://nuzzles.dev
 */


// some awesome utilities that i pretty much need or else my code will suck 🐾
import { sendBotError } from "@magicalbunny31/awesome-utility-stuff";


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
      Discord.GatewayIntentBits.GuildMembers
   ]
});


// listen to events
const events = await readdir(`./events`);
for (const file of events) {
   const event = await import(`./events/${file}`);
   if (!event.once) client.on  (event.name, (...args) => event.default(...args));
   else             client.once(event.name, (...args) => event.default(...args));
};


// send errors to an error webhook
process.on("uncaughtException", async (error, origin) => {
   await sendBotError(
      `uncaughtException`,
      {
         url: process.env.WEBHOOK_ERRORS
      },
      error
   );

   console.error(error);
   process.exit(1);
});


// log in to discord
await client.login(process.env.TOKEN);