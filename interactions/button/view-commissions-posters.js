import Discord from "discord.js";
import { strip } from "@magicalbunny31/awesome-utility-stuff";

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


   // files
   const files = [
      new Discord.AttachmentBuilder()
         .setFile(`./assets/commission-poster-1.png`)
         .setDescription(strip`
            Aethen's Robux Commissions! (once again open!)

            Main things to buy!

            Line Art head: R$310
            Line Art waist: R$380
            Line Art whole: R$440

            Flat Color head: R$390
            Flat Color waist: R$450
            Flat Color whole: R$500

            Shaded head: R$750
            Shaded waist: R$830
            Shaded whole: R$990
         `),

      new Discord.AttachmentBuilder()
         .setFile(`./assets/commission-poster-2.png`)
         .setDescription(strip`
            Extras!

            Colored line arts: R$40
            Complicated backgrounds: R$100
            Shoulder animated gif (no shade): R$5000

            Notes
            - Prices multiply as per people added (double when 2, triple when 3)
            - Free background of any complexity in line art section
            - Free simple background for flat colored section
            - Pay first then I'll start, I don't want to be scammed
            - Gacha is automatic Shaded section
            - Please pay through my game (Commissions area)

            Buy 3+ and get a discount! (Will calculate for you)
         `)
   ];


   // edit the deferred interaction
   return await interaction.editReply({
      files
   });
};