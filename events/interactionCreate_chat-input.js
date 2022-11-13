export const name = Discord.Events.InteractionCreate;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.Interaction} interaction
 */
export default async interaction => {
   // this file is for ChatInputCommandInteractions
   if (!interaction.isChatInputCommand())
      return;


   // get this command's file
   const file = await import(`../interactions/chat-input/${interaction.commandName}.js`);


   // run the command
   return await file.default(interaction);
};