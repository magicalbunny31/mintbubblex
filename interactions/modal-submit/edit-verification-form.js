import Discord from "discord.js";
import cache from "../../data/cache.js";

/**
 * @param {Discord.ModalSubmitInteraction} interaction
 */
export default async interaction => {
   // modal info
   const [ _modal ] = interaction.customId.split(`:`);


   // fields
   const name       = interaction.fields.getTextInputValue(`name`)       .trim();
   const pronouns   = interaction.fields.getTextInputValue(`pronouns`)   .trim();
   const password   = interaction.fields.getTextInputValue(`password`)   .trim();
   const otherStuff = interaction.fields.getTextInputValue(`other-stuff`).trim();


   // set these in the cache
   cache.set(`verification-form:${interaction.user.id}`, {
      name,
      pronouns,
      password,
      "other-stuff": otherStuff
   });


   // if this form is ready to be submitted
   const noPronouns = !pronouns;
   const noPassword = !password;

   const incorrectPassword = password !== process.env.PASSWORD;

   const canSubmit = !(noPronouns || noPassword || incorrectPassword);


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(interaction.user.accentColor || (await interaction.user.fetch()).accentColor || Discord.Colors.Blue)
         .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL({
               extension: `png`,
               size: 4096
            })
         })
         .setTitle(`Verification Form`)
         .setFields({
            name: `NAME`,
            value: name || `\u200b`
         }, {
            name: `PRONOUNS`,
            value: pronouns || `\u200b`
         }, {
            name: `PASSWORD`,
            value: password || `\u200b`
         }, {
            name: `OTHER STUFF`,
            value: otherStuff || `\u200b`
         })
         .setFooter({
            text: noPronouns || noPassword
               ? `❗ ${
                  noPronouns && noPassword
                  ? `PRONOUNS and PASSWORD`
                  : noPronouns
                     ? `PRONOUNS`
                     : `PASSWORD`
               } ${noPronouns && noPassword ? `are` : `is a`} required ${noPronouns && noPassword ? `fields` : `field`}.`
               : incorrectPassword
                  ? `❗ PASSWORD is incorrect.`
                  : null
         })
   ];


   // components
   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`edit-verification-form`)
               .setLabel(`Edit Verification Form`)
               .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
               .setCustomId(`submit-verification-form`)
               .setLabel(`Submit Verification Form`)
               .setStyle(Discord.ButtonStyle.Success)
               .setDisabled(!canSubmit)
         )
   ];


   // update the interaction
   return await interaction.update({
      embeds,
      components
   });
};