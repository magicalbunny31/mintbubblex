import Discord from "discord.js";

import { strip } from "@magicalbunny31/awesome-utility-stuff";

import cache from "../../data/cache.js";

/**
 * @param {Discord.ButtonInteraction} interaction
 */
export default async interaction => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // defer the interaction
   await interaction.deferReply({
      ephemeral: true
   });


   // this user is already verified
   if (interaction.member.roles.cache.has(process.env.ROLE_MEMBERS))
      return await interaction.editReply({
         content: `❌ You're already verified!`
      });


   // this user has already submitted a verification form
   const hasVerificationForm = await (async () => {
      // fetch all verification forms
      const guild = await interaction.client.guilds.fetch(process.env.GUILD_FOXIE);
      const channel = await guild.channels.fetch(process.env.CHANNEL_VERIFICATION_FORMS);

      const messages = await (async () => {
         const fetchedMessages = [];
         let lastMessage;

         while (true) {
            const messages = (await channel.messages.fetch({ limit: 100, ...fetchedMessages.length ? { before: fetchedMessages.at(-1).id } : {} }))
               .filter(m => m.author.id === interaction.client.user.id && !m.system);

            fetchedMessages.push(...messages.values());

            if (lastMessage?.id === fetchedMessages.at(-1)?.id)
               break;

            else
               lastMessage = fetchedMessages.at(-1);

            await wait(1000);
         };

         return fetchedMessages;
      })();


      // find the verification form's message of the user that was updated
      const message = messages.find(m => m.embeds[0].footer.text === interaction.user.id);

      return !!message;
   })();

   if (hasVerificationForm)
      return await interaction.editReply({
         content: strip`
            ❌ You've already submitted a verification form!
            ❓ Don't worry if it's not perfect: none of this information is saved and is only for ${Discord.roleMention(process.env.ROLE_STAFF)} to screen you first.
            👥 Got a question? Feel free to DM a ${Discord.roleMention(process.env.ROLE_STAFF)} member.
         `
      });


   // an interaction response already exists for this user, delete the response
   const duplicateInteractionResponse = cache.get(`duplicate-interaction:${interaction.user.id}`);

   if (duplicateInteractionResponse)
      await new Discord.WebhookClient(duplicateInteractionResponse)
         .deleteMessage(`@original`);


   // set the current interaction response in the cache, to prevent duplicate menus
   cache.set(`duplicate-interaction:${interaction.user.id}`, {
      id: interaction.webhook.id,
      token: interaction.webhook.token
   });


   // get any cache of the verification form
   const { name, pronouns, password, "other-stuff": otherStuff } = cache.get(`verification-form:${interaction.user.id}`) || {};


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
            text: !canSubmit
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


   // edit the interaction's original reply
   return await interaction.editReply({
      embeds,
      components
   });
};