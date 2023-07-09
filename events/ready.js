export const name = Discord.Events.ClientReady;
export const once = true;


import Discord from "discord.js";
import fs from "fs/promises";

/**
 * @param {Discord.Client} client
 */
export default async client => {
   // commands
   const commands = [];

   for (const file of await fs.readdir(`./interactions/chat-input`))
      commands.push((await import(`../interactions/chat-input/${file}`)).data);

   await client.application.commands.set(commands, process.env.GUILD_FOXIE);


   // statuses
   setInterval(async () => {
      // offline-soon or maintenance
      const fennecStatus = await client.fennec.getStatus();
      if ([ `offline-soon`, `maintenance` ].includes(fennecStatus))
         return client.user.setPresence({
            status: Discord.PresenceUpdateStatus.DoNotDisturb,
            activities: [{
               type: Discord.ActivityType.Playing,
               name: `${fennecStatus === `offline-soon` ? `offline soon~` : `in maintenance!`} 🔧`
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
   },
      1.8e+6
   ); // change status every 30 minutes


   // log to console once everything is done
   console.log(`uwu~`);
};