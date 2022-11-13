import Discord from "discord.js";
import cache from "../../data/cache.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 */
export default async interaction => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // get any cache of the verification form
   const { name, pronouns, password, "other-stuff": otherStuff } = cache.get(`verification-form:${interaction.user.id}`) || {};


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`edit-verification-form`)
      .setTitle(`Verification Form`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`name`)
                  .setLabel(`NAME`)
                  .setPlaceholder(`What's your name? (Optional)`)
                  .setValue(name || ``)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(1024)
                  .setRequired(false)
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`pronouns`)
                  .setLabel(`PRONOUNS`)
                  .setPlaceholder(`Your pronouns.`)
                  .setValue(pronouns || ``)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(1024)
                  .setRequired(true)
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`password`)
                  .setLabel(`PASSWORD`)
                  .setPlaceholder(`The password to gain access to the server.`)
                  .setValue(password || ``)
                  .setStyle(Discord.TextInputStyle.Short)
                  .setMaxLength(1024)
                  .setRequired(true)
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`other-stuff`)
                  .setLabel(`OTHER STUFF`)
                  .setPlaceholder(`Anything else to say? (Optional)`)
                  .setValue(otherStuff || ``)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(1024)
                  .setRequired(false)
            )
      );


   // show the modal to the user
   return await interaction.showModal(modal);
};