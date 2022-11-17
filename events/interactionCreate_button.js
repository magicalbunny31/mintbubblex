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


   // get this command's file
   const file = await import(`../interactions/button/${interaction.customId.split(`:`)[0]}.js`);


   // run the command
   return await file.default(interaction);
};