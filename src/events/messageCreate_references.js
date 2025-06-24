import Discord from "discord.js";
import { choice } from "@magicalbunny31/pawesome-utility-stuffs";


export const name = Discord.Events.MessageCreate;


/**
 * @param {import("@mintbubblex-types/client").Message} message
 */
export default async message => {
   // don't listen to bots, webhooks, or system messages
   if (message.author.bot || message.webhookId || message.system)
      return;


   // this isn't a potential reference
   const mentionRegexp = new RegExp(`^(<@!?${message.client.user.id}>)\\s*`);
   const referenceContent = message.content.toLowerCase();

   if (!mentionRegexp.test(referenceContent))
      return;


   // get this reference
   const [ _, matchedMention ] = referenceContent.match(mentionRegexp);
   const [ referenceName ] = referenceContent.slice(matchedMention.length).trim().split(/\s+/);


   // what to do based on this reference
   switch (referenceName) {
      case `tail`:
      case `tails`:
         return void await message.react(
            choice([
               message.client.allEmojis.tails_agree,
               message.client.allEmojis.tails_cheer,
               message.client.allEmojis.tails_idle,
               message.client.allEmojis.tails_wave
            ])
         );

      case `kit`:
      case `kitsunami`:
         return void await message.react(
            choice([
               message.client.allEmojis.kitsunami_huh,
               message.client.allEmojis.kitsunami_shock,
               message.client.allEmojis.kitsunami_surprised
            ])
         );

      case `axetal`:
         return void await message.react(message.client.allEmojis.axetal);
   };
};