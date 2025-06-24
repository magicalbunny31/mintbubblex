import Slendyblox from "../../classes/slendyblox.js";

import Discord from "discord.js";


export const data = new Discord.SlashCommandBuilder()
   .setName(`slendyblox`)
   .setDescription(`View information about Slendyblox`)
   .addStringOption(
      new Discord.SlashCommandStringOption()
         .setName(`page`)
         .setDescription(`Page to view`)
         .setAutocomplete(true)
         .setRequired(false)
   )
   .addBooleanOption(
      new Discord.SlashCommandBooleanOption()
         .setName(`hidden`)
         .setDescription(`Hide the reply so that only you can see it?`)
         .setRequired(false)
   )
   .setContexts(Discord.InteractionContextType.Guild, Discord.InteractionContextType.BotDM, Discord.InteractionContextType.PrivateChannel)
   .setIntegrationTypes(Discord.ApplicationIntegrationType.GuildInstall, Discord.ApplicationIntegrationType.UserInstall);


/**
 * @param {import("@mintbubblex-types/client").ChatInputCommandInteraction} interaction
 */
export default async interaction => {
   // options
   const page = interaction.options.getString(`page`);


   // get the pagesIndex of this page
   const slendyblox = new Slendyblox(interaction);

   const pagesIndex = slendyblox.getPagesIndex(page);


   // show the page
   await slendyblox.showPage(page, pagesIndex);
};