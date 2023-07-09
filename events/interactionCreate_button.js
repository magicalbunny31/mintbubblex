export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this file is for ButtonInteractions
   if (!interaction.isButton())
      return;


   // this user is in the global blacklist
   if (interaction.client.blacklist.includes(interaction.user.id))
      return await interaction.client.fennec.warnBlacklisted(interaction, process.env.SUPPORT_GUILD);


   // maintenance
   if (await interaction.client.fennec.getStatus() === `maintenance`)
      if (!JSON.parse(process.env.DEVELOPERS.replaceAll(`'`, `"`)).includes(interaction.user.id))
         return await interaction.client.fennec.warnMaintenance(interaction);


   // get this command's file
   const file = await import(`../interactions/button/${interaction.customId.split(`:`)[0]}.js`);


   try {
      // run the file
      await file.default(interaction);


   } catch (error) {
      // an error occurred
      try {
         await interaction.client.fennec.respondToInteractionWithError(interaction);
         return await interaction.client.fennec.sendError(error, Math.floor(interaction.createdTimestamp / 1000), interaction);

      } finally {
         return console.error(error.stack);
      };
   };
};