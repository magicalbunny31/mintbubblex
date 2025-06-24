import fs from "node:fs/promises";
import Discord from "discord.js";
import { deferComponents, respondToErrorInteraction } from "@magicalbunny31/pawesome-utility-stuffs";


export default class Fox {
   constructor(interaction) {
      this.#interaction = interaction;
   };


   /**
    * @type {import("@mintbubblex-types/client").ChatInputCommandInteraction | import("@mintbubblex-types/client").ButtonInteraction}
    */
   #interaction;


   get #hidden() {
      return this.#interaction.options.getBoolean(`hidden`) ?? false;
   };


   async #deferInteraction() {
      switch (true) {
         // defer the interaction
         case this.#interaction.isChatInputCommand():
            return void await this.#interaction.deferReply({
               flags: [
                  ...this.#hidden
                     ? [ Discord.MessageFlags.Ephemeral ]
                     : []
               ]
            });

         // update the interaction's original reply, or create a new reply
         case this.#interaction.isButton():
            const isCommandReply = this.#interaction.message?.interactionMetadata;
            const isSameCommandUser = this.#interaction.message?.interactionMetadata.user.id === this.#interaction.user.id;
            const isEphemeral = this.#interaction.message?.flags.has(Discord.MessageFlags.Ephemeral);
            if ((isCommandReply && isSameCommandUser) || isEphemeral)
               return void await this.#interaction.update({
                  components: deferComponents(this.#interaction.customId, this.#interaction.message.components)
               });
            else
               return void await this.#interaction.deferReply({
                  flags: [
                     Discord.MessageFlags.Ephemeral
                  ]
               });
      };
   };


   #safeParseJSON(json) {
      try {
         return JSON.parse(json);
      } catch (error) {
         return undefined;
      };
   };


   async #getFox() {
      const { name } = JSON.parse(await fs.readFile(`./package.json`));

      const basic = `${name}:${process.env.FOX_BOT_MEDIA_AUTHORISATION}`;
      const encoded = Buffer.from(basic).toString(`base64`);

      const response = await fetch(`https://fox-bot-media.workers.nuzzles.dev/fox`, {
         headers: {
            Accept: `application/json`,
            Authorization: `Basic ${encoded}`
         }
      });

      if (!response.ok) {
         const errorSource = `${Discord.inlineCode(`classes`)}/${Discord.inlineCode(`fox`)}`;
         const text = await response.text();
         const cause = this.#safeParseJSON(text) || text;
         const error = new Error(`HTTP ${response.status} ${response.statusText}`, { cause });
         await this.#interaction.client.fennec.postErrorLog(error, errorSource, new Date());
         return error;
      };

      const data = await response.json();
      return data;
   };


   #getComponents(data) {
      return [
         new Discord.MediaGalleryBuilder()
            .addItems(
               new Discord.MediaGalleryItemBuilder()
                  .setURL(data.media.url)
                  .setDescription(`fox`)
            ),

         new Discord.SeparatorBuilder()
            .setDivider(true)
            .setSpacing(Discord.SeparatorSpacingSize.Small),

         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`fox`)
                  .setLabel(`/fox`)
                  .setEmoji(this.#interaction.client.allEmojis.guild_banner)
                  .setStyle(Discord.ButtonStyle.Primary),
               new Discord.ButtonBuilder()
                  .setLabel(data.api.name)
                  .setEmoji(this.#interaction.client.allEmojis.community)
                  .setStyle(Discord.ButtonStyle.Link)
                  .setURL(data.api.url),
               new Discord.ButtonBuilder()
                  .setLabel(`fox bot 🦊`)
                  .setEmoji(this.#interaction.client.allEmojis.fox_bot)
                  .setStyle(Discord.ButtonStyle.Link)
                  .setURL(`https://discord.com/discovery/applications/964619726888239255`)
            )
      ];
   };


   #getFlags() {
      return [
         ...(this.#interaction.isChatInputCommand() && this.#hidden)
            ? [ Discord.MessageFlags.Ephemeral ]
            : [],
         Discord.MessageFlags.IsComponentsV2
      ];
   };


   async showFox() {
      // defer the interaction
      await this.#deferInteraction();


      // get a random fox media
      const data = await this.#getFox();


      // failed to get random fox media
      if (data instanceof Error)
         return void await respondToErrorInteraction(this.#interaction, undefined, data);


      // respond to the interaction
      await this.#interaction.editReply({
         components: this.#getComponents(data),
         flags: this.#getFlags()
      });
   };
};