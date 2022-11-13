export const name = Discord.Events.GuildMemberRemove;
export const once = false;


import Discord from "discord.js";

/**
 * @param {Discord.GuildMember} member
 */
export default async member => {
   // this isn't from Aethen's Social Area
   if (member.guild.id !== process.env.GUILD_FOXIE)
      return;


   // fetch all verification forms
   const channel = await member.guild.channels.fetch(process.env.CHANNEL_VERIFICATION_FORMS);

   const messages = await (async () => {
      const fetchedMessages = [];
      let lastMessage;

      while (true) {
         const messages = (await channel.messages.fetch({ limit: 100, ...fetchedMessages.length ? { before: fetchedMessages.at(-1).id } : {} }))
            .filter(m => m.author.id === member.client.user.id && !m.system);

         fetchedMessages.push(...messages.values());

         if (lastMessage?.id === fetchedMessages.at(-1)?.id)
            break;

         else
            lastMessage = fetchedMessages.at(-1);

         await wait(1000);
      };

      return fetchedMessages;
   })();


   // find the verification form's message of the member that left
   const message = messages.find(m => m.embeds[0].footer.text === member.id);

   if (!message)
      return;


   // delete this verification form
   return await message.delete();
};