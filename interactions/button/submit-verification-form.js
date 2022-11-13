import Discord from "discord.js";

import { emojis, strip } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.ButtonInteraction} interaction
 */
export default async interaction => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // update the interaction
   await interaction.update({
      content: null,
      embeds: [
         ...interaction.message.embeds,
         new Discord.EmbedBuilder()
            .setColor(interaction.user.accentColor || (await interaction.user.fetch()).accentColor || Discord.Colors.Blue)
            .setDescription(emojis.loading)
      ],
      components: []
   });


   // send the verification form to staff
   const channel = await interaction.guild.channels.fetch(process.env.CHANNEL_VERIFICATION_FORMS);

   const embeds = [
      new Discord.EmbedBuilder(interaction.message.embeds[0].data)
         .spliceFields(2, 1)
         .setFooter({
            text: interaction.user.id
         })
   ];

   const components = [
      new Discord.ActionRowBuilder()
         .setComponents(
            new Discord.ButtonBuilder()
               .setCustomId(`approve-verification-form`)
               .setLabel(`Approve`)
               .setStyle(Discord.ButtonStyle.Success),
            new Discord.ButtonBuilder()
               .setCustomId(`deny-verification-form`)
               .setLabel(`Deny`)
               .setStyle(Discord.ButtonStyle.Danger)
         )
   ];

   await channel.send({
      embeds,
      components
   });


   // edit this member's roles
   await interaction.member.roles.add   (process.env.ROLE_AWAITING_VERIFICATION);
   await interaction.member.roles.remove(process.env.ROLE_UNVERIFIED);


   // edit the original interaction
   return await interaction.editReply({
      embeds: [
         ...interaction.message.embeds,
         new Discord.EmbedBuilder()
            .setColor(interaction.user.accentColor || (await interaction.user.fetch()).accentColor || Discord.Colors.Blue)
            .setDescription(strip`
               ✅ Verification Form sent!
               📥 Enable "Direct Messages" in the Privacy Settings for this server to get updated on when your Verification Form gets accepted. 
            `)
      ]
   });
};