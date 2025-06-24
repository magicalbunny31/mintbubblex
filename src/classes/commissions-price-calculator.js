import Discord from "discord.js";
import { colours, deferComponents } from "@magicalbunny31/pawesome-utility-stuffs";


export default class CommissionsPriceCalculator {
   constructor(interaction) {
      this.#interaction = interaction;
   };


   /**
    * @type {import("@mintbubblex-types/client").ChatInputCommandInteraction | import("@mintbubblex-types/client").ButtonInteraction | import("@mintbubblex-types/client").StringSelectMenuInteraction}
    */
   #interaction;


   get #hidden() {
      return this.#interaction.options?.getBoolean(`hidden`) ?? false;
   };


   get #bitFields() {
      return {
         // characters
         oneCharacter:    1 << 0,
         twoCharacters:   1 << 1,
         threeCharacters: 1 << 2,
         fourCharacters:  1 << 3,
         fiveCharacters:  1 << 4,

         // base-style
         lineArt:  1 << 5,
         coloured: 1 << 6,
         shade:    1 << 7,

         // position
         headBust:  1 <<  8,
         waist:     1 <<  9,
         wholeBody: 1 << 10,

         // other
         colouredLineArts:      1 << 11,
         complicatedBackground: 1 << 12,
         headBustAnimatedGif:   1 << 13
      };
   };


   /**
    * @param {`characters` | `base-style` | `position` | `other`} feature
    */
   #getBitFields(feature) {
      switch (feature) {
         case `characters`:
            return [
               this.#bitFields.oneCharacter,
               this.#bitFields.twoCharacters,
               this.#bitFields.threeCharacters,
               this.#bitFields.fourCharacters,
               this.#bitFields.fiveCharacters
            ];

         case `base-style`:
            return  [
               this.#bitFields.lineArt,
               this.#bitFields.coloured,
               this.#bitFields.shade
            ];

         case `position`:
            return  [
               this.#bitFields.headBust,
               this.#bitFields.waist,
               this.#bitFields.wholeBody
            ];

         case `other`:
            return  [
               this.#bitFields.colouredLineArts,
               this.#bitFields.complicatedBackground,
               this.#bitFields.headBustAnimatedGif
            ];
      };
   };


   /**
    * @param {number} wholeBitField
    * @param {number} bitField
    */
   #hasBitField(wholeBitField, bitField) {
      return (wholeBitField & bitField) === bitField;
   };


   /**
    * @param {number} wholeBitField
    */
   #getCharacters(wholeBitField) {
      switch (true) {
         case this.#hasBitField(wholeBitField, this.#bitFields.oneCharacter):    return 1;
         case this.#hasBitField(wholeBitField, this.#bitFields.twoCharacters):   return 2;
         case this.#hasBitField(wholeBitField, this.#bitFields.threeCharacters): return 3;
         case this.#hasBitField(wholeBitField, this.#bitFields.fourCharacters):  return 4;
         case this.#hasBitField(wholeBitField, this.#bitFields.fiveCharacters):  return 5;
      };
   };


   /**
    * @param {number} wholeBitField
    * @param {`characters` | `base-style` | `position` | `other`} feature
    * @param {string[]} values
    */
   getBitField(wholeBitField, feature, values) {
      // the bit fields from the values
      const bitFields = this.#getBitFields(feature);


      // loop the bit fields and add to the wholeBitField what values are included
      for (const bitField of bitFields) {
         if (values.includes(`${bitField}`)) // values are always strings of numbers
            wholeBitField |= bitField; // set this bit field to true if this bit field exists in the list of values
         else if (this.#hasBitField(wholeBitField, +bitField))
            wholeBitField ^= bitField; // if the above is false, set this bit field to false if this bit field exists in the wholeBitField
      };


      // correct the wholeBitField if one of its bit fields becomes invalid due to other bit fields
      if (this.#hasBitField(wholeBitField, this.#bitFields.lineArt) && this.#hasBitField(wholeBitField, this.#bitFields.complicatedBackground))
         wholeBitField ^= this.#bitFields.complicatedBackground;

      if ((this.#getCharacters(wholeBitField) > 1 || this.#hasBitField(wholeBitField, this.#bitFields.shade) || !this.#hasBitField(wholeBitField, this.#bitFields.headBust)) && this.#hasBitField(wholeBitField, this.#bitFields.headBustAnimatedGif))
         wholeBitField ^= this.#bitFields.headBustAnimatedGif;


      // return the wholeBitField
      return wholeBitField;
   };


   #respondedToInteraction = false;


   #isSameCommandUser() {
      const isCommandReply = this.#interaction.message?.interactionMetadata;
      const isSameCommandUser = this.#interaction.message?.interactionMetadata.user.id === this.#interaction.user.id;
      const isEphemeral = this.#interaction.message?.flags.has(Discord.MessageFlags.Ephemeral);

      return (isCommandReply && isSameCommandUser) || isEphemeral;
   };


   async #deferInteraction() {
      switch (true) {
         // update the interaction's original reply or create a new reply
         case this.#interaction.isButton():
            this.#respondedToInteraction = true;
            if (this.#isSameCommandUser())
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


   async #respondToInteraction(payload) {
      switch (true) {
         // reply to the interaction
         case this.#interaction.isChatInputCommand():
            return void await this.#interaction.reply(payload);

         // update the interaction's original reply or create a new reply
         case this.#interaction.isButton():
         case this.#interaction.isStringSelectMenu():
            if (this.#respondedToInteraction)
               return void await this.#interaction.editReply(payload);
            else if (this.#isSameCommandUser())
               return void await this.#interaction.update(payload);
            else
               return void await this.#interaction.reply(payload);
      };
   };


   /**
    * @param {number} wholeBitField
    */
   #calculatePrice(wholeBitField) {
      // the starting price in robux
      let price = 0;


      // prices for base-style
      if (this.#hasBitField(wholeBitField, this.#bitFields.lineArt)) {
         switch (true) {
            case this.#hasBitField(wholeBitField, this.#bitFields.headBust):  price += 310; break;
            case this.#hasBitField(wholeBitField, this.#bitFields.waist):     price += 380; break;
            case this.#hasBitField(wholeBitField, this.#bitFields.wholeBody): price += 440; break;
         };

      } else if (this.#hasBitField(wholeBitField, this.#bitFields.coloured)) {
         switch (true) {
            case this.#hasBitField(wholeBitField, this.#bitFields.headBust):  price += 390; break;
            case this.#hasBitField(wholeBitField, this.#bitFields.waist):     price += 450; break;
            case this.#hasBitField(wholeBitField, this.#bitFields.wholeBody): price += 500; break;
         };

      } else if (this.#hasBitField(wholeBitField, this.#bitFields.shade)) {
         switch (true) {
            case this.#hasBitField(wholeBitField, this.#bitFields.headBust):  price += 750; break;
            case this.#hasBitField(wholeBitField, this.#bitFields.waist):     price += 830; break;
            case this.#hasBitField(wholeBitField, this.#bitFields.wholeBody): price += 990; break;
         };
      };


      // prices for characters
      const characters = this.#getCharacters(wholeBitField);
      price *= characters;


      // characters discounts
      if (characters === 3)
         price *= .9;
      else if (characters === 4 || characters === 5)
         price *= .85;


      // prices for other
      if (this.#hasBitField(wholeBitField, this.#bitFields.colouredLineArts))
         price += 40;

      if (this.#hasBitField(wholeBitField, this.#bitFields.complicatedBackground))
         price += 400;

      if (this.#hasBitField(wholeBitField, this.#bitFields.headBustAnimatedGif))
         price += 5000;


      // if position values haven't been selected yet, return undefined
      const hasPositionValues = [ this.#bitFields.headBust, this.#bitFields.waist, this.#bitFields.wholeBody ].some(bitField => this.#hasBitField(wholeBitField, bitField));

      if (!hasPositionValues)
         return undefined;


      // return the calculated price (rounded)
      return Math.round(price);
   };

   /**
    * @param {number} wholeBitField
    */
   #getCalculationEmbeds(wholeBitField) {
      // get discounts
      const characters = this.#getCharacters(wholeBitField);

      const discounts = [
         ...characters === 3 ? [ `10% off total price` ] : [],
         ...characters === 4 ? [ `15% off total price` ] : [],
         ...characters === 5 ? [ `15% off total price` ] : [],

         ...!this.#hasBitField(wholeBitField, this.#bitFields.complicatedBackground)
            ? [
               ...this.#hasBitField(wholeBitField, this.#bitFields.lineArt)  ? [ `Free complex background` ] : [],
               ...this.#hasBitField(wholeBitField, this.#bitFields.coloured) ? [ `Free simple background` ]  : []
            ]
            : []
      ];


      return [
         new Discord.EmbedBuilder()
            .setColor(colours.mintbubblex)
            .setFields({
               name: `Price`,
               value: Discord.inlineCode(`R$ ${this.#calculatePrice(wholeBitField)?.toLocaleString() ?? `---`}`),
               inline: true
            }, {
               name: `Discounts`,
               value: Discord.unorderedList(discounts) || `\u200b`,
               inline: true
            })
            .setFooter({
               text: `All prices are estimations`
            })
      ];
   };


   get #payForCommissionsButton() {
      return new Discord.ButtonBuilder()
         .setLabel(`Pay for commissions`)
         .setStyle(Discord.ButtonStyle.Link)
         .setEmoji(this.#interaction.client.allEmojis.roblox)
         .setURL(`https://www.roblox.com/games/8475587540/Commissions-Area`);
   };


   /**
    * @param {number} wholeBitField
    */
   #getCalculationComponents(wholeBitField) {
      // the components which contains action rows which contains components
      const components = [];

      const isEnglishUS = this.#interaction.locale === Discord.Locale.EnglishUS;


      // characters select menu
      components.push(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.StringSelectMenuBuilder()
                  .setCustomId(`commissions-price-calculator:characters:${wholeBitField}`)
                  .setPlaceholder(`Select the amount of characters`)
                  .setOptions(
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`1 character`)
                        .setValue(`${this.#bitFields.oneCharacter}`)
                        .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.oneCharacter)),
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`2 characters`)
                        .setValue(`${this.#bitFields.twoCharacters}`)
                        .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.twoCharacters)),
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`3 characters`)
                        .setDescription(`10% off total price`)
                        .setValue(`${this.#bitFields.threeCharacters}`)
                        .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.threeCharacters)),
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`4 characters`)
                        .setDescription(`15% off total price`)
                        .setValue(`${this.#bitFields.fourCharacters}`)
                        .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.fourCharacters)),
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`5 characters`)
                        .setDescription(`15% off total price`)
                        .setValue(`${this.#bitFields.fiveCharacters}`)
                        .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.fiveCharacters))
                  )
            )
      );


      // base-style select menu
      components.push(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.StringSelectMenuBuilder()
                  .setCustomId(`commissions-price-calculator:base-style:${wholeBitField}`)
                  .setPlaceholder(`Select a base style`)
                  .setOptions(
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`Line art only`)
                        .setDescription(`Includes a free background with any complexity`)
                        .setValue(`${this.#bitFields.lineArt}`)
                        .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.lineArt)),
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`Flat ${isEnglishUS ? `color` : `colour`}ed`)
                        .setDescription(`Includes a free simple background`)
                        .setValue(`${this.#bitFields.coloured}`)
                        .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.coloured)),
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`${isEnglishUS ? `Color` : `Colour`}ed with shading`)
                        .setDescription(`Gacha commissions are ${isEnglishUS ? `color` : `colour`}ed with shading only`)
                        .setValue(`${this.#bitFields.shade}`)
                        .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.shade))
                  )
            )
      );


      // position select menu
      const hasBaseStyleValues = [ this.#bitFields.lineArt, this.#bitFields.coloured, this.#bitFields.shade ].some(bitField => this.#hasBitField(wholeBitField, bitField));

      components.push(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.StringSelectMenuBuilder()
                  .setCustomId(`commissions-price-calculator:position:${wholeBitField}`)
                  .setPlaceholder(
                     hasBaseStyleValues
                        ? `Select a position`
                        : `Select a base style to view positions`
                  )
                  .setOptions(
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`Head bust`)
                        .setValue(`${this.#bitFields.headBust}`)
                        .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.headBust)),
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`Half-body`)
                        .setValue(`${this.#bitFields.waist}`)
                        .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.waist)),
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`Full-body`)
                        .setValue(`${this.#bitFields.wholeBody}`)
                        .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.wholeBody))
                  )
                  .setDisabled(!hasBaseStyleValues)
            )
      );


      // other select menu
      const hasPositionValues = [ this.#bitFields.headBust, this.#bitFields.waist, this.#bitFields.wholeBody ].some(bitField => this.#hasBitField(wholeBitField, bitField));

      const otherOptions = [
         new Discord.StringSelectMenuOptionBuilder()
            .setLabel(`${isEnglishUS ? `Color` : `Colour`}ed line art`)
            .setValue(`${this.#bitFields.colouredLineArts}`)
            .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.colouredLineArts)),
         ...!this.#hasBitField(wholeBitField, this.#bitFields.lineArt)
            ? [
               new Discord.StringSelectMenuOptionBuilder()
                  .setLabel(`Complicated background`)
                  .setValue(`${this.#bitFields.complicatedBackground}`)
                  .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.complicatedBackground))
            ]
            : [],
         ...this.#hasBitField(wholeBitField, this.#bitFields.oneCharacter) && !this.#hasBitField(wholeBitField, this.#bitFields.shade) && this.#hasBitField(wholeBitField, this.#bitFields.headBust)
            ? [
               new Discord.StringSelectMenuOptionBuilder()
                  .setLabel(`Animated GIF`)
                  .setDescription(`Line art only or flat ${isEnglishUS ? `color` : `colour`}ed with head bust only`)
                  .setValue(`${this.#bitFields.headBustAnimatedGif}`)
                  .setDefault(this.#hasBitField(wholeBitField, this.#bitFields.headBustAnimatedGif))
            ]
            : []
      ];

      components.push(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.StringSelectMenuBuilder()
                  .setCustomId(`commissions-price-calculator:other:${wholeBitField}`)
                  .setPlaceholder(
                     hasPositionValues
                        ? `Select extras`
                        : `Select a position to view extras`
                  )
                  .setMinValues(0)
                  .setMaxValues(otherOptions.length)
                  .setOptions(otherOptions)
                  .setDisabled(!hasPositionValues)
            )
      );


      // add button components
      components.push(
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`commissions-price-calculator:view-posters:${wholeBitField}`)
                  .setLabel(`View posters`)
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setEmoji(this.#interaction.client.allEmojis.guild_banner),
               this.#payForCommissionsButton
            )
      );


      // return the components
      return components;
   };


   async showCalculator(wholeBitField = this.#bitFields.oneCharacter) {
      // embeds
      const embeds = this.#getCalculationEmbeds(wholeBitField);


      // components
      const components = this.#getCalculationComponents(wholeBitField);


      // respond to the interaction
      await this.#respondToInteraction({
         embeds,
         components,
         files: [],
         flags: [
            ...(
               this.#interaction.isChatInputCommand()
                  ? this.#hidden
                  : !(this.#respondedToInteraction && this.#isSameCommandUser())
            )
               ? [ Discord.MessageFlags.Ephemeral ]
               : []
         ]
      });
   };


   /**
    * @param {number} wholeBitField
    */
   async showPosters(wholeBitField) {
      // defer the interaction
      await this.#deferInteraction();


      // components
      const components = [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`commissions-price-calculator:${wholeBitField}`)
                  .setLabel(`Back to calculator`)
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setEmoji(this.#interaction.client.allEmojis.insights),
               new Discord.ButtonBuilder()
                  .setCustomId(`commissions-price-calculator:view-examples:${wholeBitField}`)
                  .setLabel(`View more art examples`)
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setEmoji(this.#interaction.client.allEmojis.guild_banner)
            )
      ];


      // files
      const files = [
         new Discord.AttachmentBuilder()
            .setFile(`./src/assets/commissions-price-calculator/0.jpg`)
            .setDescription(
               [
                  `Aethen's Robux Commissions! (once again open!)`,
                  ``,
                  `Main things to buy!`,
                  ``,
                  `Line art head: R$310`,
                  `Line art waist: R$380`,
                  `Line art whole: R$440`,
                  ``,
                  `Flat color head: R$390`,
                  `Flat color waist: R$450`,
                  `Flat color whole: R$500`,
                  ``,
                  `Shaded head: R$750`,
                  `Shaded waist: R$830`,
                  `Shaded whole: R$990`
               ]
                  .join(`\n`)
            ),

         new Discord.AttachmentBuilder()
            .setFile(`./src/assets/commissions-price-calculator/1.jpg`)
            .setDescription(
               [
                  `Extras!`,
                  ``,
                  `Colored line arts: R$40`,
                  `Complicated backgrounds: R$400`,
                  `Shoulder animated gif (no shade): R$5000`,
                  ``,
                  `Notes`,
                  `- Prices multiply as per people added (double when 2, triple when 3)`,
                  `- Free background of any complexity in line art section`,
                  `- Free simple background for flat colored section`,
                  `- Pay first then I'll start, I don't want to be scammed`,
                  `- Gacha is automatic Shaded section`,
                  `- Please pay through my game (Commissions area)`,
                  ``,
                  `Buy 3+ and get a discount! (Will calculate for you)`
               ]
                  .join(`\n`)
            ),

         new Discord.AttachmentBuilder()
            .setFile(`./src/assets/commissions-price-calculator/2.jpg`)
            .setDescription(
               [
                  `I DO:`,
                  `Furries`,
                  `Cookie run styles`,
                  `Humans`,
                  `Gore`,
                  `Animals`,
                  `Simple weapons`,
                  `Gacha`,
                  `Animatronics (like FNAF)`,
                  ``,
                  `I DON'T DO`,
                  `NSFW`,
                  `Hate speech`,
                  `Robots (literal)`,
                  `Complicated weapons`,
                  `Complicated poses`
               ]
                  .join(`\n`)
            ),

         new Discord.AttachmentBuilder()
            .setFile(`./src/assets/commissions-price-calculator/3.jpg`)
            .setDescription(`Art examples!`)
      ];


      // edit the deferred interaction
      await this.#respondToInteraction({
         embeds: [],
         components,
         files
      });
   };


   /**
    * @param {number} wholeBitField
    */
   async showExamples(wholeBitField) {
      // defer the interaction
      await this.#deferInteraction();


      // components
      const components = [
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`commissions-price-calculator:${wholeBitField}`)
                  .setLabel(`Back to calculator`)
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setEmoji(this.#interaction.client.allEmojis.insights),
               new Discord.ButtonBuilder()
                  .setCustomId(`commissions-price-calculator:view-posters:${wholeBitField}`)
                  .setLabel(`View posters`)
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setEmoji(this.#interaction.client.allEmojis.guild_banner)
            )
      ];


      // files
      const files = [
         new Discord.AttachmentBuilder()
            .setFile(`./src/assets/commissions-price-calculator/4.jpg`),

         new Discord.AttachmentBuilder()
            .setFile(`./src/assets/commissions-price-calculator/5.jpg`),

         new Discord.AttachmentBuilder()
            .setFile(`./src/assets/commissions-price-calculator/6.jpg`),

         new Discord.AttachmentBuilder()
            .setFile(`./src/assets/commissions-price-calculator/7.jpg`)
      ];


      // edit the deferred interaction
      await this.#respondToInteraction({
         embeds: [],
         components,
         files
      });
   };
};