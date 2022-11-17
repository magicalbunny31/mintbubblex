export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this file is for ModalSubmitInteractions
   if (!interaction.isModalSubmit())
      return;


   // get this command's file
   const file = await import(`../interactions/modal-submit/${interaction.customId.split(`:`)[0]}.js`);


   // run the command
   return await file.default(interaction);
};