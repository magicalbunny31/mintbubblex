export const cron = "*/10 * * * *"; // at every 10th minute

import Discord from "discord.js";

/**
 * @param {import("discord.js").Client} client
 */
export default async client => {
   // offline-soon or maintenance
   const fennecStatus = await client.fennec.getStatus();

   if ([ `offline-soon`, `maintenance` ].includes(fennecStatus))
      return client.user.setPresence({
         status: Discord.PresenceUpdateStatus.DoNotDisturb,
         activities: [{
            name: `${fennecStatus === `offline-soon` ? `i'll be offline soon~` : `currently in maintenance!`} 🔧`,
            type: Discord.ActivityType.Custom
         }]
      });


   // set presence
   client.user.setPresence({
      status: Discord.PresenceUpdateStatus.Online,
      activities: [{
         name: `over the crew`,
         type: Discord.ActivityType.Watching
      }]
   });
};