import Discord from "discord.js";
import { emojis, noop, strip } from "@magicalbunny31/awesome-utility-stuff";

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


   // update the interaction
   for (const actionRow of interaction.message.components)
      for (const button of actionRow.components)
         button.data.disabled = true;

   Object.assign(interaction.message.components[0].components[0].data, {
      label: null,
      emoji: Discord.parseEmoji(emojis.loading)
   });

   await interaction.update({
      components: interaction.message.components
   });


   // get this member
   const id = interaction.message.embeds[0].footer.text;
   const member = await interaction.guild.members.fetch(id);


   // edit this member's roles
   await member.roles.add   (process.env.ROLE_MEMBERS);
   await member.roles.remove(process.env.ROLE_AWAITING_VERIFICATION);


   // try to dm the newly verified member
   try {
      const embeds = [
         new Discord.EmbedBuilder()
            .setColor(interaction.message.embeds[0].color)
            .setDescription(strip`
               📝 Your Verification Form was approved!
               💬 Check out the server by pressing the button below.
            `)
            .setFooter({
               text: interaction.guild.name,
               iconURL: interaction.guild.iconURL({
                  extension: `png`,
                  size: 4096
               })
            })
      ];

      const components = [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setLabel(`View Server`)
                  .setStyle(Discord.ButtonStyle.Link)
                  .setURL(`https://discord.com/channels/${process.env.GUILD_FOXIE}`)
            )
      ];

      await member.send({
         embeds,
         components
      });

   } catch {
      noop;
   };


   // edit the verification form's embed
   return await interaction.editReply({
      embeds: [
         new Discord.EmbedBuilder(interaction.message.embeds[0].data)
            .setFooter({
               text: `✅ Approved by ${interaction.user.tag}`,
               iconURL: interaction.user.displayAvatarURL({
                  extension: `png`,
                  size: 4096
               })
            })
      ],
      components: []
   });
};