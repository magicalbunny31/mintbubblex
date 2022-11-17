export const data = new Discord.SlashCommandBuilder()
   .setName(`commissions-price-calculator`)
   .setDescription(`Calculate the price of a commission.`);


import Discord from "discord.js";

/**
 * @param {Discord.ChatInputCommandInteraction} interaction
 */
export default async interaction => {
   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(Discord.Colors.Blue)
         .setFields({
            name: `Price`,
            value: `\`R$ ---\``,
            inline: true
         }, {
            name: `Selected Features`,
            value: `\u200b`,
            inline: true
         }, {
            name: `Discounts`,
            value: `\u200b`,
            inline: true
         })
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`commissions-price-calculator:characters`)
               .setPlaceholder(`Select the amount of characters...`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`1 Character`)
                     .setValue(`1`)
                     .setDefault(true),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`2 Characters`)
                     .setValue(`2`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`3 Characters`)
                     .setDescription(`10% off price of characters`)
                     .setValue(`3`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`4 Characters`)
                     .setDescription(`15% off price of characters`)
                     .setValue(`4`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`5 Characters`)
                     .setDescription(`15% off price of characters`)
                     .setValue(`5`)
               )
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`commissions-price-calculator:base-style`)
               .setPlaceholder(`Select a base style...`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Line Art`)
                     .setDescription(`Includes a free background with any complexity.`)
                     .setValue(`line-art`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Flat ${interaction.locale === Discord.Locale.EnglishUS ? `color` : `colour`}ed`)
                     .setDescription(`Includes a free simple background.`)
                     .setValue(`coloured`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`${interaction.locale === Discord.Locale.EnglishUS ? `Color` : `Colour`}ed with shading`)
                     .setDescription(`Gacha commissions are ${interaction.locale === Discord.Locale.EnglishUS ? `color` : `colour`}ed with shading only.`)
                     .setValue(`shade`)
               )
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`commissions-price-calculator:position`)
               .setPlaceholder(`Select a base style to view positions.`)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Head Bust`)
                     .setValue(`head-bust`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Half-body`)
                     .setValue(`waist`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Full-body`)
                     .setValue(`whole-body`)
               )
               .setDisabled(true)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.StringSelectMenuBuilder()
               .setCustomId(`commissions-price-calculator:other`)
               .setPlaceholder(`Select a position to view extras.`)
               .setMinValues(0)
               .setMaxValues(3)
               .setOptions(
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`${interaction.locale === Discord.Locale.EnglishUS ? `Color` : `Colour`}ed Line Art`)
                     .setValue(`coloured-line-arts`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Complicated Background`)
                     .setValue(`complicated-background`),
                  new Discord.StringSelectMenuOptionBuilder()
                     .setLabel(`Animated GIF`)
                     .setDescription(`Line Art or ${interaction.locale === Discord.Locale.EnglishUS ? `Color` : `Colour`}ed + Head Bust only.`)
                     .setValue(`head-bust-animated-gif`)
               )
               .setDisabled(true)
         ),

      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setLabel(`Pay For Commissions Here`)
               .setStyle(Discord.ButtonStyle.Link)
               .setURL(`https://www.roblox.com/games/8475587540/Commissions-Area`),
            new Discord.ButtonBuilder()
               .setCustomId(`view-commissions-posters`)
               .setLabel(`View Posters`)
               .setStyle(Discord.ButtonStyle.Primary)
         )
   ];


   // reply to the interaction
   return await interaction.reply({
      embeds,
      components,
      ephemeral: true
   });
};