import Discord from "discord.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 */
export default async interaction => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // this isn't a staff member
   if (!interaction.member.roles.cache.has(process.env.ROLE_STAFF))
      return await interaction.reply({
         content: `❌ You must have the ${Discord.roleMention(process.env.ROLE_STAFF)} role to approve or deny Verification Forms.`,
         ephemeral: true
      });


   // modal
   const modal = new Discord.ModalBuilder()
      .setCustomId(`deny-verification-form`)
      .setTitle(`Deny Verification Form`)
      .setComponents(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.TextInputBuilder()
                  .setCustomId(`reason`)
                  .setLabel(`REASON`)
                  .setPlaceholder(`Why are you denying this Verification Form?`)
                  .setStyle(Discord.TextInputStyle.Paragraph)
                  .setMaxLength(1024)
                  .setRequired(true)
            )
      );


   // show the modal to the user
   return await interaction.showModal(modal);
};