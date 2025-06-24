import Fox from "../../classes/fox.js";

import Discord from "discord.js";


export const data = new Discord.SlashCommandBuilder()
   .setName(`fox`)
   .setDescription(`Get a random fox media`)
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
   // show a fox
   const fox = new Fox(interaction);
   await fox.showFox();
};