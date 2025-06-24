import CommissionsPriceCalculator from "../../classes/commissions-price-calculator.js";

import Discord from "discord.js";


export const data = new Discord.SlashCommandBuilder()
   .setName(`commissions-price-calculator`)
   .setDescription(`Calculate the price of a commission`)
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
   // show the calculator
   const commissionsPriceCalculator = new CommissionsPriceCalculator(interaction);
   await commissionsPriceCalculator.showCalculator();
};