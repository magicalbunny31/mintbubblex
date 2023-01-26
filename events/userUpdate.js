export const name = Discord.Events.UserUpdate;
export const once = false;


import Discord from "discord.js";
import { wait } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.User} oldUser
 * @param {Discord.User} newUser
 */
export default async (oldUser, newUser) => {
   // username#tag or avatar didn't change
   if (oldUser.username === newUser.username && oldUser.tag === newUser.tag && oldUser.avatar === newUser.avatar)
      return;


   // fetch all verification forms
   const guild = await newUser.client.guilds.fetch(process.env.GUILD_FOXIE);
   const channel = await guild.channels.fetch(process.env.CHANNEL_VERIFICATION_FORMS);

   const messages = await (async () => {
      const fetchedMessages = [];
      let lastMessage;

      while (true) {
         const messages = (await channel.messages.fetch({ limit: 100, ...fetchedMessages.length ? { before: fetchedMessages.at(-1).id } : {} }))
            .filter(m => m.author.id === newUser.client.user.id && !m.system);

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
   const message = messages.find(m => m.embeds[0].footer.text === newUser.id);

   if (!message)
      return;


   // edit this verification form
   return await message.edit({
      embeds: [
         new Discord.EmbedBuilder(message.embeds[0].data)
            .setAuthor({
               name: interaction.user.tag,
               iconURL: interaction.user.displayAvatarURL({
                  extension: `png`,
                  size: 4096
               })
            })
      ]
   });
};