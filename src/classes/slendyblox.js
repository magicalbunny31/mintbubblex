import userAgent from "../data/user-agent.js";
import { AethenLee, magicalbunny31, fcfolf } from "../data/users.js";

import Discord from "discord.js";
import dayjs from "dayjs";
import { fileTypeFromBuffer } from "file-type";
import { colours, deferComponents, respondToWrongUserMessageComponentInteraction } from "@magicalbunny31/pawesome-utility-stuffs";


export default class Slendyblox {
   constructor(interaction) {
      this.#interaction = interaction;
   };


   /**
    * @type {import("@mintbubblex-types/client").AutocompleteInteraction | import("@mintbubblex-types/client").ChatInputCommandInteraction | import("@mintbubblex-types/client").ButtonInteraction | import("@mintbubblex-types/client").StringSelectMenuInteraction | import("@mintbubblex-types/client").ModalSubmitInteraction}
    */
   #interaction;


   get #hidden() {
      return this.#interaction.options?.getBoolean(`hidden`) ?? false;
   };


   #respondedToInteraction = false;


   #isSameCommandUser() {
      const isCommandReply = this.#interaction.message?.interactionMetadata;
      const isSameCommandUser = this.#interaction.message?.interactionMetadata.user.id === this.#interaction.user.id;
      const isEphemeral = this.#interaction.message?.flags.has(Discord.MessageFlags.Ephemeral);

      return (isCommandReply && isSameCommandUser) || isEphemeral;
   };


   async #deferInteraction() {
      // this interaction was already responded to
      if (this.#respondedToInteraction)
         return;

      // set this interaction as responded to
      this.#respondedToInteraction = true;

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

         // update the interaction's original reply or create a new reply
         case this.#interaction.isButton():
         case this.#interaction.isStringSelectMenu():
            if (this.#isSameCommandUser())
               return void await this.#interaction.update({
                  components: deferComponents(this.#interaction.customId, this.#interaction.message.components, this.#interaction.values),
                  allowedMentions: {
                     parse: []
                  }
               });
            else
               return void await this.#interaction.deferReply({
                  flags: [
                     Discord.MessageFlags.Ephemeral
                  ]
               });

         // don't actually do anything
         case this.#interaction.isModalSubmit():
            break;
      };
   };


   async #respondToInteraction(payload) {
      switch (true) {
         // edit the interaction's original reply or reply to the interaction
         case this.#interaction.isChatInputCommand():
            if (this.#respondedToInteraction)
               return void await this.#interaction.editReply(payload);
            else
               return void await this.#interaction.reply(payload);

         // update the interaction's original reply or create a new reply
         case this.#interaction.isButton():
         case this.#interaction.isStringSelectMenu():
         case this.#interaction.isModalSubmit():
            if (this.#respondedToInteraction)
               return void await this.#interaction.editReply(payload);
            else if (this.#isSameCommandUser())
               return void await this.#interaction.update(payload);
            else
               return void await this.#interaction.reply(payload);
      };
   };


   /**
    * @returns {Promise<import("@mintbubblex-types/slendyblox").PageWithId[]>}
    */
   async getPages() {
      // get all pages with their ids
      const slendybloxColRef    = this.#interaction.client.firestore.collection(`slendyblox`);
      const slendybloxQuery     = slendybloxColRef.orderBy(`name`, `asc`);
      const slendybloxQuerySnap = await slendybloxQuery.get();
      const slendybloxColDocs   = slendybloxQuerySnap.docs
         .map(slendybloxDocSnap =>
            ({
               ...slendybloxDocSnap.data(),
               id: slendybloxDocSnap.id
            })
         );

      return slendybloxColDocs;
   };


   /**
    * @param {string} pageId
    * @returns {Promise<import("@mintbubblex-types/slendyblox").Page?>}
    */
   async #getPage(pageId) {
      // get the page with this pageId
      const slendybloxDocRef  = this.#interaction.client.firestore.collection(`slendyblox`).doc(pageId);
      const slendybloxDocSnap = await slendybloxDocRef.get();
      const slendybloxDocData = slendybloxDocSnap.data();

      return slendybloxDocData;
   };


   /**
    * @param {string} pageId
    * @returns {Promise<number?>}
    */
   async getPagesIndex(pageId) {
      // get the pagesIndex of this pageId
      const pages      = await this.getPages();
      const pagesMenu  = Array.from(
         new Array(Math.ceil(pages.length / this.#pagesPageSize)),
         (_element, i) => pages.slice(i * this.#pagesPageSize, i * this.#pagesPageSize + this.#pagesPageSize)
      );
      const pagesIndex = pagesMenu.findIndex(entries => !!entries.find(page => page.id === pageId));

      return pagesIndex !== -1
         ? pagesIndex
         : undefined;
   };


   /**
    * @param {string} pageId
    * @returns {Promise<import("@mintbubblex-types/slendyblox").PageContent[]?>}
    */
   async #getPageContents(pageId) {
      // get this page's contents
      const contentColRef  = this.#interaction.client.firestore.collection(`slendyblox`).doc(pageId).collection(`contents`);
      const contentColSnap = await contentColRef.get();
      const contentColDocs = [];


      // for each page's content, map its data with its media
      for (const contentDocSnap of contentColSnap.docs) {
         const contentDocData = contentDocSnap.data();

         const mediaColRef    = contentDocSnap.ref.collection(`media`);
         const mediaColQuery  = mediaColRef.orderBy(`index`, `asc`);
         const mediaQuerySnap = await mediaColQuery.get();
         const mediaColDocs   = mediaQuerySnap.docs;
         const media          = mediaColDocs.map(mediaDocSnap => mediaDocSnap.data());

         contentColDocs.push({
            ...contentDocData,
            media
         });
      };


      // return all mapped page's content with its media
      return contentColDocs;
   };


   /**
    * @param {string} pageId
    * @param {number} contentIndex
    * @returns {Promise<import("@mintbubblex-types/slendyblox").PageContent?>}
    */
   async #getPageContent(pageId, contentIndex) {
      // get this page's contents
      const contentColRef      = this.#interaction.client.firestore.collection(`slendyblox`).doc(pageId).collection(`contents`);
      const contentColQuery    = contentColRef.where(`index`, `==`, contentIndex).limit(1);
      const contentQuerySnap   = await contentColQuery.get();
      const [ contentDocSnap ] = contentQuerySnap.docs;


      // this page('s content) doesn't exist
      if (!contentDocSnap.exists)
         return;


      // get this page's content's media
      const mediaColRef    = contentDocSnap.ref.collection(`media`);
      const mediaColQuery  = mediaColRef.orderBy(`index`, `asc`);
      const mediaQuerySnap = await mediaColQuery.get();
      const mediaColDocs   = mediaQuerySnap.docs;
      const media          = mediaColDocs.map(mediaDocSnap => mediaDocSnap.data());


      // return the page's content with its media
      const contentDocData = contentDocSnap.data();

      return {
         ...contentDocData,
         media
      };
   };


   #pagesPageSize = 25;


   /**
    * @param {import("@mintbubblex-types/slendyblox").PageWithId[]} pages
    * @param {number} [index=0]
    * @returns {import("@mintbubblex-types/slendyblox").PageWithId[]}
    */
   #getPagesToShow(pages, index = 0) {
      // get the 25 pages at this index and return it
      const pagesToShow = pages.slice(index * this.#pagesPageSize, this.#pagesPageSize + (index * this.#pagesPageSize));
      return pagesToShow;
   };


   #canManagePages() {
      const allowedUsers = [ AethenLee, magicalbunny31, fcfolf ];

      return this.#interaction.inGuild()
         ? this.#interaction.memberPermissions.has(Discord.PermissionFlagsBits.ManageGuild)
         : allowedUsers.includes(this.#interaction.user.id);
   };


   async #respondUnableManagePages() {
      // respond to the interaction
      const components = [
         new Discord.TextDisplayBuilder()
            .setContent(
               Discord.heading(`${this.#interaction.client.allEmojis.cross} Only ${this.#interaction.inGuild() ? `staff member` : `information hub editor`}s are able to edit pages`)
            )
      ];

      await this.#respondToInteraction({
         components,
         flags: [
            Discord.MessageFlags.Ephemeral,
            Discord.MessageFlags.IsComponentsV2
         ]
      });
   };


   /**
    * @param {string?} pageId
    * @param {number} [pagesIndex=0]
    * @param {number} [contentIndex=0]
    * @param {boolean} [showManagePagesOptions=false]
    */
   async showPage(pageId, pagesIndex = 0, contentIndex = 0, showManagePagesOptions = false) {
      // this user can't manage pages
      if (showManagePagesOptions && !this.#canManagePages())
         return void await this.#respondUnableManagePages();


      // defer the interaction
      await this.#deferInteraction();


      // application commands
      const commands = await this.#interaction.client.application.commands.fetch();

      const commandSlendybloxId = commands.find(command => command.name === `slendyblox`)?.id ?? 0;


      // get this pageId's PageContent
      const pageContents = pageId
         ? await this.#getPageContents(pageId)
         : undefined;

      const pageContent  = pageContents?.[contentIndex]
         ?? pageContents?.[0];


      // format the pages menu
      const pages       = await this.getPages();
      const pagesToShow = this.#getPagesToShow(pages, pagesIndex).length
         ? this.#getPagesToShow(pages, pagesIndex)
         : this.#getPagesToShow(pages, 0);
      const pagesPages  = Math.ceil(pages.length / this.#pagesPageSize);


      // the create page button
      const createPageButton = new Discord.ButtonBuilder()
         .setCustomId(`slendyblox:create-page:${pageId ?? ``}`)
         .setLabel(`Create a new page`)
         .setEmoji(this.#interaction.client.allEmojis.create_category)
         .setStyle(Discord.ButtonStyle.Secondary);


      // components
      const components = [
         new Discord.ContainerBuilder()
            .setAccentColor(colours.mintbubblex)
            .addTextDisplayComponents(
               new Discord.TextDisplayBuilder()
                  .setContent(
                     pageContent?.content
                        ?? [
                           Discord.heading(`Welcome to the ${this.#interaction.client.allEmojis.slash_command} ${Discord.chatInputApplicationCommandMention(`slendyblox`, commandSlendybloxId)} information hub!`, Discord.HeadingLevel.Three),
                           pages.length
                              ? this.#canManagePages()
                                 ? `Select an option below to view a page or press the ${Discord.bold(`${this.#interaction.client.allEmojis.create_category} Create a new page`)} button below.`
                                 : `Select an option below to view a page.`
                              : this.#canManagePages()
                                 ? `Press the ${Discord.bold(`${this.#interaction.client.allEmojis.create_category} Create a new page`)} button below.`
                                 : `There are currently no pages to view - wait for a ${this.#interaction.inGuild() ? `staff member` : `information hub editor`} to create a page.`
                        ]
                           .join(`\n`)
                  )
            ),


         ...showManagePagesOptions
            ? [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     new Discord.StringSelectMenuBuilder()
                        .setCustomId(`slendyblox:manage-page:${pageId}:${contentIndex}`)
                        .setPlaceholder(`Select an option to manage this page`)
                        .setOptions(
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`Add new page content`)
                              .setValue(`create-page-content`)
                              .setDescription(`Create a new separate page of content`)
                              .setEmoji(this.#interaction.client.allEmojis.add),
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`Edit this page`)
                              .setValue(`update-page`)
                              .setDescription(`Edit this specific page's name and description`)
                              .setEmoji(this.#interaction.client.allEmojis.edit),
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`Edit this page's content`)
                              .setValue(`update-page-content`)
                              .setDescription(`Edit this specific page's content`)
                              .setEmoji(this.#interaction.client.allEmojis.edit),
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`About this page`)
                              .setValue(`about-page`)
                              .setDescription(`View who created this page, its contents and any edits to it`)
                              .setEmoji(this.#interaction.client.allEmojis.summaries),
                           new Discord.StringSelectMenuOptionBuilder()
                              .setLabel(`Delete this page`)
                              .setValue(`delete-page`)
                              .setDescription(
                                 [
                                    `Delete this specific page's content`,
                                    ...pageContent?.media.length
                                       ? [ `and its media` ]
                                       : []
                                 ]
                                    .join(` `)
                              )
                              .setEmoji(this.#interaction.client.allEmojis.delete),
                           ...pageContent?.media.length < 10
                              ? [
                                 new Discord.StringSelectMenuOptionBuilder()
                                    .setLabel(`Upload media`)
                                    .setValue(`upload-media`)
                                    .setDescription(`Add a new image or video at the end of this page's content`)
                                    .setEmoji(this.#interaction.client.allEmojis.upload_file)
                              ]
                              : [],
                           ...pageContent?.media.length >= 1
                              ? [
                                 new Discord.StringSelectMenuOptionBuilder()
                                    .setLabel(`Delete media`)
                                    .setValue(`delete-media`)
                                    .setDescription(`Delete media from this page's content`)
                                    .setEmoji(this.#interaction.client.allEmojis.delete)
                              ]
                              : []
                        )
                  )
            ]
            : pages.length
               ? [
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.StringSelectMenuBuilder()
                           .setCustomId(`slendyblox:view-page:${pagesIndex}`)
                           .setPlaceholder(`Select a page to view`)
                           .setOptions(
                              pagesToShow.map(page => {
                                 const option = new Discord.StringSelectMenuOptionBuilder()
                                    .setLabel(page.name)
                                    .setValue(page.id)
                                    .setDefault(pageId === page.id && !!pageContent?.content);

                                 if (page.description)
                                    option.setDescription(page.description);

                                 return option;
                              })
                           )
                     ),

                  ...pagesPages > 1
                     ? [
                        new Discord.ActionRowBuilder()
                           .setComponents(
                              new Discord.ButtonBuilder()
                                 .setCustomId(`slendyblox:view-page:${undefined}:${pagesIndex - 1}`)
                                 .setEmoji(this.#interaction.client.allEmojis.left)
                                 .setStyle(Discord.ButtonStyle.Primary)
                                 .setDisabled(pagesIndex - 1 < 0),
                              new Discord.ButtonBuilder()
                                 .setCustomId(`slendyblox:view-page:${undefined}:${pagesIndex + 1}`)
                                 .setEmoji(this.#interaction.client.allEmojis.right)
                                 .setStyle(Discord.ButtonStyle.Primary)
                                 .setDisabled(pagesIndex + 1 >= pagesPages),
                              new Discord.ButtonBuilder()
                                 .setCustomId(`🦊`)
                                 .setLabel(`${pagesIndex + 1} / ${pagesPages}`)
                                 .setStyle(Discord.ButtonStyle.Secondary)
                                 .setDisabled(true)
                           )
                     ]
                     : []
               ]
               : [],

         ...this.#canManagePages()
            ? [
               new Discord.ActionRowBuilder()
                  .setComponents(
                     pageContent
                        ? showManagePagesOptions
                           ? [
                              new Discord.ButtonBuilder()
                                 .setCustomId(`slendyblox:view-page:${pageId}:${pagesIndex}:${contentIndex}:${!showManagePagesOptions}`)
                                 .setLabel(`Exit managing pages`)
                                 .setEmoji(this.#interaction.client.allEmojis.close_2)
                                 .setStyle(Discord.ButtonStyle.Danger),
                              createPageButton
                           ]
                           : [
                              new Discord.ButtonBuilder()
                                 .setCustomId(`slendyblox:view-page:${pageId}:${pagesIndex}:${contentIndex}:${!showManagePagesOptions}`)
                                 .setLabel(`Manage pages`)
                                 .setEmoji(this.#interaction.client.allEmojis.filter)
                                 .setStyle(Discord.ButtonStyle.Secondary)
                           ]
                        : [ createPageButton ]
                  )
            ]
            : []
      ];


      // if this page has media, then add a media gallery to the container
      if (pageContent?.media.length)
         components[0].addMediaGalleryComponents(
            new Discord.MediaGalleryBuilder()
               .addItems(
                  pageContent.media.map(media =>
                     new Discord.MediaGalleryItemBuilder()
                        .setURL(media.url)
                  )
               )
         );


      // add the menu for the pages
      const pageInfoActionRowComponents = !showManagePagesOptions
         ? [
            ...contentIndex - 1 >= 0
               ? [
                  new Discord.ButtonBuilder()
                     .setCustomId(`slendyblox:view-page:${pageId}:${pagesIndex}:${pageContent.index - 1}`)
                     .setEmoji(this.#interaction.client.allEmojis.left)
                     .setStyle(Discord.ButtonStyle.Primary)
               ]
               : [],
            ...contentIndex + 1 < pageContents?.length
               ? [
                  new Discord.ButtonBuilder()
                     .setCustomId(`slendyblox:view-page:${pageId}:${pagesIndex}:${pageContent.index + 1}`)
                     .setEmoji(this.#interaction.client.allEmojis.right)
                     .setStyle(Discord.ButtonStyle.Primary)
               ]
               : []
         ]
         : [];

      if (pageContent && pageInfoActionRowComponents.length)
         components[0]
            .addSeparatorComponents(
               new Discord.SeparatorBuilder()
                  .setDivider(true)
                  .setSpacing(Discord.SeparatorSpacingSize.Small)
            )
            .addActionRowComponents(
               new Discord.ActionRowBuilder()
                  .setComponents(pageInfoActionRowComponents)
            );


      // edit the deferred interaction
      await this.#respondToInteraction({
         components,
         flags: [
            Discord.MessageFlags.IsComponentsV2
         ],
         allowedMentions: {
            parse: []
         }
      });
   };


   /**
    * @param {string} previousCustomId
    * @param {string} modalCustomId
    */
   async #showAwaitingModalInput(previousCustomId, modalCustomId) {
      // edit the interaction's original reply
      const components = [
         new Discord.TextDisplayBuilder()
            .setContent(
               [
                  Discord.heading(`${this.#interaction.client.allEmojis.context_menu_command} Awaiting modal input`, Discord.HeadingLevel.Three),
                  `If you closed the modal by accident, you can re-open it by pressing the ${Discord.bold(`${this.#interaction.client.allEmojis.edit} Re-open modal`)} button below.`,
                  `Changed your mind? Press the ${Discord.bold(`${this.#interaction.client.allEmojis.close} Cancel input`)} button to view the pages again.`
               ]
                  .join(`\n`)
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(previousCustomId)
                  .setLabel(`Cancel input`)
                  .setEmoji(this.#interaction.client.allEmojis.close)
                  .setStyle(Discord.ButtonStyle.Secondary),
               new Discord.ButtonBuilder()
                  .setCustomId(modalCustomId)
                  .setLabel(`Re-open modal`)
                  .setEmoji(this.#interaction.client.allEmojis.edit_2)
                  .setStyle(Discord.ButtonStyle.Primary)
            )
      ];

      await this.#interaction.editReply({
         components
      });
   };


   /**
    * @param {string?} [pageId=``]
    * @param {`create-page` | `create-page-content` | `update-page` | `update-page-content`} subcommand
    * @param {number} [contentIndex=0]
    */
   async showModal(pageId = ``, subcommand, contentIndex = 0) {
      // this user can't manage pages
      if (!this.#canManagePages())
         return void await this.#respondUnableManagePages();


      // this isn't the expected user
      if (this.#interaction.message?.interactionMetadata?.user.id !== this.#interaction.user.id)
         return void await respondToWrongUserMessageComponentInteraction(this.#interaction, this.#interaction.message.interactionMetadata.user, this.#interaction.user);


      // the modal
      const modalCustomId = `slendyblox:${subcommand}:${subcommand === `create-page` ? `` : pageId}:${contentIndex}`; // if we're creating a new page, the pageId should be empty when re-opening the modal so that it knows we're creating a new page

      const modal = new Discord.ModalBuilder()
         .setCustomId(modalCustomId);

      switch (subcommand) {
         case `create-page`:
         case `create-page-content`:
            // if a new page is being created then add a text input for the name and description
            if (subcommand === `create-page`)
               modal
                  .addComponents(
                     new Discord.ActionRowBuilder()
                        .setComponents(
                           new Discord.TextInputBuilder()
                              .setCustomId(`name`)
                              .setLabel(`Name`)
                              .setStyle(Discord.TextInputStyle.Short)
                              .setPlaceholder(`What will this page be called?`)
                              .setMaxLength(100)
                              .setRequired(true)
                        )
                  )
                  .addComponents(
                     new Discord.ActionRowBuilder()
                        .setComponents(
                           new Discord.TextInputBuilder()
                              .setCustomId(`description`)
                              .setLabel(`Description`)
                              .setStyle(Discord.TextInputStyle.Short)
                              .setPlaceholder(`What short description describes this page?`)
                              .setMaxLength(100)
                              .setRequired(false)
                        )
                  );

            // add the rest of the components (and title) for the modal
            modal
               .setTitle(
                  pageId
                     ? `Add new page content`
                     : `Create a new page`
               )
               .addComponents(
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.TextInputBuilder()
                           .setCustomId(`page-content`)
                           .setLabel(`Page Content`)
                           .setStyle(Discord.TextInputStyle.Paragraph)
                           .setPlaceholder(`The page's content to display, markdown is supported.`)
                           .setMaxLength(4000)
                           .setRequired(true)
                     )
               );

            // break out
            break;


         case `update-page`:
            // get this page
            const page = await this.#getPage(pageId);

            // configure the modal
            modal
               .setTitle(`Edit this page`)
               .addComponents(
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.TextInputBuilder()
                           .setCustomId(`name`)
                           .setLabel(`Name`)
                           .setStyle(Discord.TextInputStyle.Short)
                           .setPlaceholder(`What will this page be called?`)
                           .setMaxLength(100)
                           .setValue(page.name)
                           .setRequired(true)
                     )
               )
               .addComponents(
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.TextInputBuilder()
                           .setCustomId(`description`)
                           .setLabel(`Description`)
                           .setStyle(Discord.TextInputStyle.Short)
                           .setPlaceholder(`What short description describes this page?`)
                           .setMaxLength(100)
                           .setValue(page.description || ``)
                           .setRequired(false)
                     )
               );

            // break out
            break;


         case `update-page-content`:
            // get this page's content
            const pageContent = await this.#getPageContent(pageId, contentIndex);

            // configure the modal
            modal
               .setTitle(`Edit this page's content`)
               .addComponents(
                  new Discord.ActionRowBuilder()
                     .setComponents(
                        new Discord.TextInputBuilder()
                           .setCustomId(`page-content`)
                           .setLabel(`Page Content`)
                           .setStyle(Discord.TextInputStyle.Paragraph)
                           .setPlaceholder(`The page's content to display, markdown is supported.`)
                           .setMaxLength(4000)
                           .setValue(pageContent.content)
                           .setRequired(true)
                     )
               );

            // break out
            break;
      };


      // show the modal
      await this.#interaction.showModal(modal);


      // edit the deferred interaction to show that the app is awaiting the user's input from this modal
      await this.#showAwaitingModalInput(`slendyblox:view-page:${pageId}:${contentIndex}`, modalCustomId);
   };


   /**
    * @param {string?} pageId
    * @param {string?} name
    * @param {string?} description
    * @param {string} pageContent
    */
   async createPage(pageId, name, description, pageContent) {
      // "defer" the interaction
      await this.#respondToInteraction({
         components: [
            new Discord.TextDisplayBuilder()
               .setContent(
                  Discord.heading(`${this.#interaction.client.allEmojis.loading} Creating page...`, Discord.HeadingLevel.Three)
               )
         ]
      });


      // add this new page (content)
      const thisPageId = pageId || this.#interaction.id;

      const pageContents = await this.#getPageContents(thisPageId);
      const contentIndex = pageContents?.length ?? 0; // since length is always +1 from the 0-based index, we don't need to +1 to the index

      const pageDocRef           = this.#interaction.client.firestore.collection(`slendyblox`).doc(thisPageId);
      const pageChangesDocRef    = pageDocRef.collection(`changes`).doc(thisPageId);
      const contentDocRef        = pageDocRef.collection(`contents`).doc(this.#interaction.id);
      const contentChangesDocRef = contentDocRef.collection(`changes`).doc(this.#interaction.id);

      const batch = this.#interaction.client.firestore.batch()
         .create(contentDocRef, {
            at:      this.#interaction.createdAt,
            author:  this.#interaction.user.id,
            content: pageContent,
            index:   contentIndex
         })
         .create(contentChangesDocRef, {
            at:      this.#interaction.createdAt,
            author:  this.#interaction.user.id,
            content: pageContent
         });

      if (!pageId)
         batch
            .create(pageDocRef, {
               description: description ?? null,
               name
            })
            .create(pageChangesDocRef, {
               at:          this.#interaction.createdAt,
               author:      this.#interaction.user.id,
               description: description ?? null,
               name
            });

      await batch.commit();


      // show the created page
      const pagesIndex = await this.getPagesIndex(thisPageId);

      await this.showPage(thisPageId, pagesIndex, contentIndex);
   };


   /**
    * @param {string} pageId
    * @param {string} name
    * @param {string?} description
    */
   async updatePage(pageId, name, description) {
      // "defer" the interaction
      await this.#respondToInteraction({
         components: [
            new Discord.TextDisplayBuilder()
               .setContent(
                  Discord.heading(`${this.#interaction.client.allEmojis.loading} Updating page...`, Discord.HeadingLevel.Three)
               )
         ]
      });


      // update this page
      const pageDocRef    = this.#interaction.client.firestore.collection(`slendyblox`).doc(pageId);
      const changesDocRef = pageDocRef.collection(`changes`).doc(this.#interaction.id);

      const pageData = {
         name,
         description: description ?? null
      };

      await this.#interaction.client.firestore.batch()
         .update(pageDocRef, pageData)
         .create(changesDocRef, {
            at:      this.#interaction.createdAt,
            author:  this.#interaction.user.id,
            ...pageData
         })
         .commit();


      // show the updated page
      const pagesIndex = await this.getPagesIndex(pageId);

      await this.showPage(pageId, pagesIndex);
   };


   /**
    * @param {string} pageId
    * @param {number} contentIndex
    * @param {string} pageContent
    */
   async updatePageContent(pageId, contentIndex, pageContent) {
      // "defer" the interaction
      await this.#respondToInteraction({
         components: [
            new Discord.TextDisplayBuilder()
               .setContent(
                  Discord.heading(`${this.#interaction.client.allEmojis.loading} Updating page...`, Discord.HeadingLevel.Three)
               )
         ]
      });


      // add this new page (content)
      const pageDocRef         = this.#interaction.client.firestore.collection(`slendyblox`).doc(pageId);
      const contentColRef      = pageDocRef.collection(`contents`);
      const contentColQuery    = contentColRef.where(`index`, `==`, contentIndex).limit(1);
      const contentQuerySnap   = await contentColQuery.get();
      const [ contentDocSnap ] = contentQuerySnap.docs;
      const changesDocRef      = contentDocSnap.ref.collection(`changes`).doc(this.#interaction.id);

      await this.#interaction.client.firestore.batch()
         .update(contentDocSnap.ref, {
            at:      this.#interaction.createdAt,
            author:  this.#interaction.user.id,
            content: pageContent
         })
         .create(changesDocRef, {
            at:      this.#interaction.createdAt,
            author:  this.#interaction.user.id,
            content: pageContent
         })
         .commit();


      // show the updated page's content
      const pagesIndex = await this.getPagesIndex(pageId);

      await this.showPage(pageId, pagesIndex, contentIndex);
   };


   /**
    * @param {string} pageId
    * @returns {Promise<import("@mintbubblex-types/slendyblox").PageChange[]>}
    */
   async #getPageChanges(pageId) {
      // get this page's changes
      const changesColRef  = this.#interaction.client.firestore.collection(`slendyblox`).doc(pageId).collection(`changes`);
      const changesColSnap = await changesColRef.get();
      const changesColDocs = changesColSnap.docs.map(changesDocSnap => changesDocSnap.data());


      // return this page's changes
      return changesColDocs;
   };


   /**
    * @param {string} pageId
    * @param {number} contentIndex
    * @returns {Promise<import("@mintbubblex-types/slendyblox").PageContentChange[]>}
    */
   async #getPageContentChanges(pageId, contentIndex) {
      // get this page's content
      const contentColRef      = this.#interaction.client.firestore.collection(`slendyblox`).doc(pageId).collection(`contents`);
      const contentColQuery    = contentColRef.where(`index`, `==`, contentIndex).limit(1);
      const contentQuerySnap   = await contentColQuery.get();
      const [ contentDocSnap ] = contentQuerySnap.docs;


      // this page('s content) doesn't exist
      if (!contentDocSnap?.exists)
         return null;


      // get this page's content's changes
      const changesColRef  = contentDocSnap.ref.collection(`changes`);
      const changesColSnap = await changesColRef.get();
      const changesColDocs = changesColSnap.docs.map(changesDocSnap => changesDocSnap.data());


      // return this page's content's changes
      return changesColDocs;
   };


   /**
    * @param {string} pageId
    * @param {number} contentIndex
    */
   async aboutPage(pageId, contentIndex) {
      // this user can't manage pages
      if (!this.#canManagePages())
         return void await this.#respondUnableManagePages();


      // defer the interaction
      await this.#deferInteraction();


      // get this page
      const page         = await this.#getPage(pageId);
      const pageContents = await this.#getPageContents(pageId);
      const pageContent  = pageContents.find(pageContent => pageContent.index === contentIndex);

      const pageChanges        = await this.#getPageChanges(pageId);
      const pageContentChanges = await this.#getPageContentChanges(pageId, contentIndex);

      const pagesIndex = await this.getPagesIndex(pageId);


      // various formatted strings
      const pageContentContentPreview = pageContent.content.split(`\n`)[0].length > 25
         ? `${pageContent.content.split(`\n`)[0].slice(0, 25)}...`
         : pageContent.content.includes(`\n`)
            ? `${pageContent.content.split(`\n`)[0]}...`
            : pageContent.content;

      const englishOrdinalRules = new Intl.PluralRules(`en`, { type: `ordinal` }); // https://stackoverflow.com/a/57518703
      const indexOrdinalSuffixCategory = englishOrdinalRules.select(pageContent.index + 1);
      const indexOrdinalSuffix = { one: `st`, two: `nd`, few: `rd`, other: `th` }[indexOrdinalSuffixCategory];


      // edit the interaction's original reply
      const components = [
         new Discord.ContainerBuilder()
            .setAccentColor(colours.mintbubblex)
            .addTextDisplayComponents(
               new Discord.TextDisplayBuilder()
                  .setContent(
                     [
                        Discord.heading(`${this.#interaction.client.allEmojis.category} ${page.name}`, Discord.HeadingLevel.Two),
                        ...page.description
                           ? [ Discord.subtext(page.description) ]
                           : [],
                        Discord.unorderedList([
                           `Created by ${Discord.userMention(pageChanges[0].author)} at ${Discord.time(pageChanges[0].at.toDate())}`,
                           ...pageChanges.length > 1
                              ? [
                                 `Last updated by ${Discord.userMention(pageChanges.at(-1).author)} at ${Discord.time(pageChanges.at(-1).at.toDate())}`,
                                 `There have been ${pageChanges.length.toLocaleString()} edits to this page in total`
                              ]
                              : []
                        ])
                     ]
                        .join(`\n`)
                  )
            )
            .addSeparatorComponents(
               new Discord.SeparatorBuilder()
                  .setDivider(true)
                  .setSpacing(Discord.SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
               new Discord.TextDisplayBuilder()
                  .setContent(
                     [
                        Discord.heading(`${this.#interaction.client.allEmojis.summaries} "${pageContentContentPreview}"`, Discord.HeadingLevel.Three),
                        Discord.unorderedList([
                           `Created by ${Discord.userMention(pageContentChanges[0].author)} at ${Discord.time(pageContentChanges[0].at.toDate())}`,
                           ...pageContentChanges.length > 1
                              ? [
                                 `Last updated by ${Discord.userMention(pageContentChanges.at(-1).author)} at ${Discord.time(pageContentChanges.at(-1).at.toDate())}`,
                                 `There have been ${pageContentChanges.length.toLocaleString()} edits to this specific page's content in total`
                              ]
                              : [],
                           `This is the ${(pageContent.index + 1).toLocaleString()}${indexOrdinalSuffix} content of this specific page's content`
                        ])
                     ]
                        .join(`\n`)
                  )
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`slendyblox:view-page:${pageId}:${pagesIndex}:${contentIndex}`)
                  .setLabel(`Back to this page`)
                  .setEmoji(this.#interaction.client.allEmojis.close)
                  .setStyle(Discord.ButtonStyle.Secondary)
            )
      ];

      await this.#respondToInteraction({
         components,
         allowedMentions: {
            parse: []
         },
         flags: [
            Discord.MessageFlags.IsComponentsV2
         ]
      });
   };


   /**
    * @param {string} mediaUrl
    * @returns {[ string, string ]}
    */
   #parseMediaFromUrl(mediaUrl) {
      const [ fullCloudStoragePath, ext ] = mediaUrl.split(`/`).pop().split(`.`);
      const mediaId = fullCloudStoragePath.slice(`slendyblox${encodeURIComponent(`/`)}`.length);
      return [ mediaId, ext ];
   };


   /**
    * @param {`page` | `media`} type
    * @param {string} pageId
    * @param {number} contentIndex
    * @param {string[]?} mediaIds
    */
   async promptDeletion(type, pageId, contentIndex, mediaIds) {
      // this user can't manage pages
      if (!this.#canManagePages())
         return void await this.#respondUnableManagePages();


      // this isn't the expected user
      if (this.#interaction.message?.interactionMetadata?.user.id !== this.#interaction.user.id)
         return void await respondToWrongUserMessageComponentInteraction(this.#interaction, this.#interaction.message.interactionMetadata.user, this.#interaction.user);


      // defer the interaction
      await this.#deferInteraction();


      // get this page
      const page = await this.#getPage(pageId);
      const pageContents = await this.#getPageContents(pageId);

      const pagesIndex = await this.getPagesIndex(pageId);


      // format the preview container of what the user selected to delete
      const hasMultipleMedia = type === `media` && mediaIds.length > 1;

      const previewContainer = new Discord.ContainerBuilder()
         .setAccentColor(colours.mintbubblex);

      if (type === `page`)
         previewContainer.addTextDisplayComponents(
            new Discord.TextDisplayBuilder()
               .setContent(pageContents[contentIndex].content)
         );

      if (pageContents[contentIndex].media.length)
         previewContainer.addMediaGalleryComponents(
            new Discord.MediaGalleryBuilder()
               .addItems(
                  pageContents[contentIndex].media
                     .filter(media => {
                        const [ mediaId ] = this.#parseMediaFromUrl(media.url);
                        return type === `page` // if we're prompting to delete a page, show all media (by returning true)
                           || mediaIds.includes(mediaId);
                     })
                     .map(media =>
                        new Discord.MediaGalleryItemBuilder()
                           .setURL(media.url)
                     )
               )
         );


      // edit the interaction's original reply
      const components = [
         new Discord.TextDisplayBuilder()
            .setContent(
               [
                  Discord.heading(`${this.#interaction.client.allEmojis.context_menu_command} WAIT!`, Discord.HeadingLevel.One),
                  Discord.heading(`${this.#interaction.client.allEmojis.delete} Are you sure you want to delete ${hasMultipleMedia ? `these` : `this`} ${type}?`, Discord.HeadingLevel.Three),
                  `Deleting ${hasMultipleMedia ? `these` : `this`} ${type} is permanent and cannot be recovered after deletion.`,
                  `There will be no traces of you deleting ${hasMultipleMedia ? `these` : `this`} ${type} either!`,
                  ...type === `page`
                     ? pageContents.length === 1
                        ? [ `Since this is the only page content for this page, the page ${Discord.bold(`${page.name}`)} will also be deleted.` ]
                        : [ `Only this page content will be deleted: other page contents within the page ${Discord.bold(`${page.name}`)} won't be deleted.` ]
                     : [],
                  `Below is the ${type} you have selected to delete.`
               ]
                  .join(`\n`)
            ),
         previewContainer,
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`slendyblox:view-page:${pageId}:${pagesIndex}:${contentIndex}`)
                  .setLabel(`Keep this ${type}`)
                  .setEmoji(this.#interaction.client.allEmojis.close)
                  .setStyle(Discord.ButtonStyle.Secondary),
               new Discord.ButtonBuilder()
                  .setCustomId(`slendyblox:delete-${type}:${pageId}:${contentIndex}`)
                  .setLabel(`Delete ${hasMultipleMedia ? `these` : `this`} ${type}`)
                  .setEmoji(this.#interaction.client.allEmojis.delete_2)
                  .setStyle(Discord.ButtonStyle.Danger)
            )
      ];

      await this.#respondToInteraction({
         components
      });
   };


   /**
    * @param {string} pageId
    * @param {number} contentIndex
    */
   async deletePage(pageId, contentIndex) {
      // this user can't manage pages
      if (!this.#canManagePages())
         return void await this.#respondUnableManagePages();


      // this isn't the expected user
      if (this.#interaction.message?.interactionMetadata?.user.id !== this.#interaction.user.id)
         return void await respondToWrongUserMessageComponentInteraction(this.#interaction, this.#interaction.message.interactionMetadata.user, this.#interaction.user);


      // defer the interaction
      await this.#deferInteraction();


      // delete this page's content
      const pageDocRef              = this.#interaction.client.firestore.collection(`slendyblox`).doc(pageId);
      const contentColRef           = pageDocRef.collection(`contents`);
      const contentColSnap          = await contentColRef.count().get();
      const { count: contentCount } = contentColSnap.data();

      if (contentCount === 1) {
         // this is the last page content for this page, just delete the entire page
         await this.#interaction.client.firestore.recursiveDelete(pageDocRef);

         // show the pages
         await this.showPage();

      } else {
         // delete this page's content
         const thisContentQuerySnap   = await contentColRef.where(`index`, `==`, contentIndex).limit(1).get();
         const [ thisContentDocSnap ] = thisContentQuerySnap.docs;
         await this.#interaction.client.firestore.recursiveDelete(thisContentDocSnap.ref);

         // fetch all other contents for this page and decrement their index if it is greater than the deleted page's content's contentIndex
         const contentQuerySnap = await contentColRef.get();
         for (const contentDocSnap of contentQuerySnap.docs) {
            const contentDocData = contentDocSnap.data();
            if (contentDocData.index > contentIndex)
               await contentDocSnap.ref.update({
                  index: contentDocData.index - 1
               });
         };

         // show this page
         const pagesIndex = await this.getPagesIndex(pageId);
         await this.showPage(pageId, pagesIndex);
      };
   };


   /**
    * 500 megabyte upper file upload limit
    */
   #fileUploadLimit = 5e+8;


   /**
    * @param {string} url
    */
   async #getBuffer(url) {
      // send a request to the url
      const response = await fetch(url, {
         headers: {
            "User-Agent": userAgent
         }
      });


      // response errored
      if (!response.ok)
         return undefined;


      // start reading and downloading chunks
      let totalBytesRead = 0;
      const chunks = [];
      const reader = response.body.getReader();

      while (true) {
         const { done, value } = await reader.read();
         if (done)
            break;

         chunks.push(value);
         totalBytesRead += value.length;

         if (totalBytesRead > this.#fileUploadLimit) { // the download has exceeded the upload limit
            await reader.cancel();
            return undefined;
         };
      };


      // construct a buffer
      const buffer = new Uint8Array(totalBytesRead);
      let offset = 0;

      for (const chunk of chunks) {
         buffer.set(chunk, offset);
         offset += chunk.length;
      };


      // return the buffer
      return Buffer.from(buffer);
   };


   #allowedFiletypes = [ `jpg`, `png`, `webp`, `gif`, `mp4`, `webm` ];


   /**
    * @param {Buffer} buffer
    */
   async #filetypeAllowed(buffer) {
      const { ext } = await fileTypeFromBuffer(buffer) || {};
      return this.#allowedFiletypes.includes(ext);
   };


   /**
    * @param {import("@mintbubblex-types/client").Message} message
    */
   async #getImageFromMessageAttachments(message) {
      // this message
      const attachments = message.attachments;


      // this message has no attachments
      if (!attachments.size)
         return null;


      // select the first attachment
      const attachment = attachments.first();


      // fetch this attachment
      const buffer = await this.#getBuffer(attachment.url);


      // image too large
      if (!buffer)
         return `too-large`;


      // this isn't a supported filetype
      if (!await this.#filetypeAllowed(buffer))
         return `not-supported-filetype`;


      // return the image buffer
      return buffer;
   };


   /**
    * @param {string} url
    * @returns {boolean}
    */
   #urlIsValid(url) {
      try {
         new URL(url);
         return true;
      } catch {
         return false;
      };
   };


   /**
    * @param {import("@mintbubblex-types/client").Message} message
    */
   async #getImageFromMessageContent(message) {
      // this message
      const content = message.content;


      // this message's content isn't (wholly) a url
      if (!this.#urlIsValid(content))
         return null;


      // fetch this image
      const buffer = await this.#getBuffer(content);


      // image too large
      if (!buffer)
         return `too-large`;


      // this isn't a supported filetype
      if (!await this.#filetypeAllowed(buffer))
         return `not-supported-filetype`;


      // return the image buffer
      return buffer;
   };


   /**
    * @param {(`too-large` | `not-supported-filetype` | `too-many-media`)?} error
    * @param {string} pageId
    * @param {number} contentIndex
    */
   async #showMediaError(error, pageId, contentIndex) {
      // edit the interaction's original reply
      const pagesIndex = await this.getPagesIndex(pageId);

      const mediaErrorContent = (() => {
         switch (error) {
            case `too-large`:
               return [
                  Discord.heading(`${this.#interaction.client.allEmojis.cross} Media too large`, Discord.HeadingLevel.Three),
                  `The maximum file size for any media is ${Discord.inlineCode(`${this.#fileUploadLimit / 1e6} MB`)}.`
               ];

            case `not-supported-filetype`:
               return [
                  Discord.heading(`${this.#interaction.client.allEmojis.cross} Unsupported file type`, Discord.HeadingLevel.Three),
                  `Media must be of one of the following file types (they must end with the file extensions): ${this.#allowedFiletypes.map(allowedFiletype => Discord.inlineCode(allowedFiletype)).join(`, `)}`
               ];

            case `too-many-media`:
               return [
                  Discord.heading(`${this.#interaction.client.allEmojis.cross} Too many media for this content`, Discord.HeadingLevel.Three),
                  `The maximum amount of media a page's content can have is ${Discord.inlineCode(`10`)}: it looks like somebody uploaded media that reached this limit before you.`
               ];

            default:
               return [
                  Discord.heading(`${this.#interaction.client.allEmojis.cross} Couldn't get media from your message`, Discord.HeadingLevel.Three)
               ];
         };
      })();

      const components = [
         new Discord.TextDisplayBuilder()
            .setContent(
               [
                  ...mediaErrorContent,
                  `If you want to try sending the media again, you can restart the prompt by pressing the ${Discord.bold(`${this.#interaction.client.allEmojis.upload_file} Retry input`)} button below.`,
                  `Changed your mind? Press the ${Discord.bold(`${this.#interaction.client.allEmojis.close} Cancel input`)} button to view the pages again.`
               ]
                  .join(`\n`)
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`slendyblox:view-page:${pageId}:${pagesIndex}:${contentIndex}`)
                  .setLabel(`Cancel input`)
                  .setEmoji(this.#interaction.client.allEmojis.close)
                  .setStyle(Discord.ButtonStyle.Secondary),
               new Discord.ButtonBuilder()
                  .setCustomId(`slendyblox:upload-media:${pageId}:${contentIndex}`)
                  .setLabel(`Retry input`)
                  .setEmoji(this.#interaction.client.allEmojis.upload_file_2)
                  .setStyle(Discord.ButtonStyle.Primary)
            )
      ];

      await this.#interaction.editReply({
         components
      });
   };


   async #showAwaitingMediaInput() {
      // when the will stop watching this channel for messages
      const expiresAt = dayjs().add(2, `minutes`).toDate();


      // update the interaction's original reply
      const components = [
         new Discord.TextDisplayBuilder()
            .setContent(
               [
                  Discord.heading(`${this.#interaction.client.allEmojis.context_menu_command} Awaiting media`, Discord.HeadingLevel.Three),
                  `${this.#interaction.user}, send one of the following in chat to include it as media in the page:`,
                  Discord.unorderedList([
                     `An image or a video (${this.#allowedFiletypes.map(allowedFiletype => Discord.inlineCode(allowedFiletype)).join(`, `)})`,
                     `A link to an image or a video (${this.#allowedFiletypes.map(allowedFiletype => Discord.inlineCode(allowedFiletype)).join(`, `)})`
                  ]),
                  `Only the first image attached will be used as the media. To upload multiple media, run this command multiple times.`,
                  `This interaction will time out ${Discord.time(expiresAt, Discord.TimestampStyles.RelativeTime)} if you don't send a message.`
               ]
                  .join(`\n`)
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(this.#interaction.id)
                  .setLabel(`Cancel input`)
                  .setEmoji(this.#interaction.client.allEmojis.close)
                  .setStyle(Discord.ButtonStyle.Secondary)
            )
      ];

      await this.#respondToInteraction({
         components
      });
   };


   /**
    * @param {Buffer} media
    * @param {string} pageId
    * @param {number} contentIndex
    */
   async #uploadMedia(media, pageId, contentIndex) {
      // the id for this media
      const mediaId = this.#interaction.id;


      // upload this media to cloud storage
      const { mime, ext } = await fileTypeFromBuffer(media);

      const file = this.#interaction.client.storage.bucket(`mintbubblex-discord`).file(`slendyblox/${mediaId}.${ext}`);
      await file.save(media);


      // get the page's content that this media is for
      const contentColRef  = this.#interaction.client.firestore.collection(`slendyblox`).doc(pageId).collection(`contents`);
      const contentColQuery = contentColRef.where(`index`, `==`, contentIndex).limit(1);
      const contentQuerySnap = await contentColQuery.get();
      const [ contentDocSnap ] = contentQuerySnap.docs;


      // get this page's content's media
      const mediaColRef = contentDocSnap.ref.collection(`media`);
      const mediaColSnap = await mediaColRef.count().get();
      const { count: mediaCount } = mediaColSnap.data(); // since length is always +1 from the 0-based index, we don't need to +1 to the index


      // save this media to cloud firestore
      const mediaDocRef = mediaColRef.doc(mediaId);
      await mediaDocRef.create({
         at: this.#interaction.createdAt,
         index: mediaCount,
         type: mime,
         url: file.publicUrl()
      });
   };


   /**
    * @param {string} pageId
    * @param {number} contentIndex
    */
   async awaitMediaInput(pageId, contentIndex) {
      // this user can't manage pages
      if (!this.#canManagePages())
         return void await this.#respondUnableManagePages();


      // this isn't the expected user
      if (this.#interaction.message?.interactionMetadata?.user.id !== this.#interaction.user.id)
         return void await respondToWrongUserMessageComponentInteraction(this.#interaction, this.#interaction.message.interactionMetadata.user, this.#interaction.user);


      // the pagesIndex of this pageId
      const pagesIndex = await this.getPagesIndex(pageId);


      // create a message collector
      const time = 2 * 60 * 1000; // two minutes

      const messageCollector = this.#interaction.channel.createMessageCollector({
         filter: m => m.author.id === this.#interaction.user.id,
         max: 1,
         time
      });


      // create an interaction collector
      const interactionCollector = this.#interaction.channel.createMessageComponentCollector({
         componentType: Discord.ComponentType.Button,
         filter: i => i.customId === this.#interaction.id,
         time
      });


      // message collected
      messageCollector.on(`collect`, async message => {
         // stop the interaction collector
         interactionCollector.stop();


         // react to the message
         await message.react(this.#interaction.client.allEmojis.loading);


         // parse the message for the media
         const media = await this.#getImageFromMessageAttachments(message)
            ?? await this.#getImageFromMessageContent(message);


         // delete the message
         await message.delete();


         // couldn't get media
         if (!media || [ `too-large`, `not-supported-filetype` ].includes(media))
            return void await this.#showMediaError(media, pageId, contentIndex);


         // there's already too much media
         const pageContent = await this.#getPageContent(pageId, contentIndex);

         if (pageContent.media.length >= 10)
            return void await this.#showMediaError(`too-many-media`, pageId, contentIndex);



         // "defer" the interaction
         await this.#interaction.editReply({
            components: [
               new Discord.TextDisplayBuilder()
                  .setContent(
                     Discord.heading(`${this.#interaction.client.allEmojis.loading} Uploading media...`, Discord.HeadingLevel.Three)
                  )
            ]
         });


         // upload this media to the page
         await this.#uploadMedia(media, pageId, contentIndex);


         // show the page that this media was uploaded to
         await this.showPage(pageId, pagesIndex, contentIndex);
      });


      // interaction collected
      interactionCollector.on(`collect`, async buttonInteraction => {
         // this isn't the expected user
         if (this.#interaction.user.id !== buttonInteraction.user.id)
            return void await respondToWrongUserMessageComponentInteraction(buttonInteraction, this.#interaction.user, buttonInteraction.user);


         // defer the interaction
         await buttonInteraction.update({
            components: deferComponents(buttonInteraction.customId, buttonInteraction.message.components)
         });


         // stop the message collector
         messageCollector.stop();
      });


      // interaction collector ended
      interactionCollector.on(`end`, async () => {
         // if the interaction collector just times out, the interaction won't "defer" and will just show this member's custom role


         // show the page that this media was uploaded to
         this.#respondedToInteraction = true;
         await this.showPage(pageId, pagesIndex, contentIndex);
      });


      // edit the deferred interaction to show that the app is awaiting the user's input from chat
      await this.#showAwaitingMediaInput();
   };


   /**
    * @param {string} pageId
    * @param {number} contentIndex
    */
   async selectMediaDeletion(pageId, contentIndex) {
      // this user can't manage pages
      if (!this.#canManagePages())
         return void await this.#respondUnableManagePages();


      // this isn't the expected user
      if (this.#interaction.message?.interactionMetadata?.user.id !== this.#interaction.user.id)
         return void await respondToWrongUserMessageComponentInteraction(this.#interaction, this.#interaction.message.interactionMetadata.user, this.#interaction.user);


      // defer the interaction
      await this.#deferInteraction();


      // get this page's content's media
      const pagesIndex = await this.getPagesIndex(pageId);

      const pageContent = await this.#getPageContent(pageId, contentIndex);


      // edit the interaction's original reply
      const components = [
         new Discord.TextDisplayBuilder()
            .setContent(
               [
                  Discord.heading(`${this.#interaction.client.allEmojis.delete} Select the media you want to delete`, Discord.HeadingLevel.Three),
                  `The media is ordered from oldest to newest: it matches the order of the media inside the select menu.`,
                  `You can select multiple options from the select menu below.`,
                  `Changed your mind? Press the ${Discord.bold(`${this.#interaction.client.allEmojis.close} Cancel input`)} button to view the pages again.`
               ]
                  .join(`\n`)
            ),
         new Discord.ContainerBuilder()
            .setAccentColor(colours.mintbubblex)
            .addMediaGalleryComponents(
               new Discord.MediaGalleryBuilder()
                  .addItems(
                     pageContent.media.map(media =>
                        new Discord.MediaGalleryItemBuilder()
                           .setURL(media.url)
                     )
                  )
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.StringSelectMenuBuilder()
                  .setCustomId(`slendyblox:delete-media:${pageId}:${contentIndex}`)
                  .setPlaceholder(`Select media to delete`)
                  .setMinValues(1)
                  .setMaxValues(pageContent.media.length)
                  .setOptions(
                     pageContent.media.map(media => {
                        const [ mediaId, ext ] = this.#parseMediaFromUrl(media.url);
                        return new Discord.StringSelectMenuOptionBuilder()
                           .setLabel(`${mediaId}.${ext}`)
                           .setValue(mediaId)
                           .setDescription(media.type);
                     })
                  )
            ),
         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.ButtonBuilder()
                  .setCustomId(`slendyblox:view-page:${pageId}:${pagesIndex}:${contentIndex}`)
                  .setLabel(`Cancel input`)
                  .setEmoji(this.#interaction.client.allEmojis.close)
                  .setStyle(Discord.ButtonStyle.Secondary)
            )
      ];

      await this.#respondToInteraction({
         components
      });
   };


   /**
    * @param {string} pageId
    * @param {number} contentIndex
    */
   async deleteMedia(pageId, contentIndex) {
      // this user can't manage pages
      if (!this.#canManagePages())
         return void await this.#respondUnableManagePages();


      // this isn't the expected user
      if (this.#interaction.message?.interactionMetadata?.user.id !== this.#interaction.user.id)
         return void await respondToWrongUserMessageComponentInteraction(this.#interaction, this.#interaction.message.interactionMetadata.user, this.#interaction.user);


      // defer the interaction
      await this.#deferInteraction();


      // get the media to delete from the media gallery
      const mediaGalleryItems = this.#interaction.message.components[1].components[0].items; // the index of the media gallery is always 0 when selecting media to delete
      const mediaIdsToDelete = mediaGalleryItems.map(item => {
         const [ mediaId, ext ] = this.#parseMediaFromUrl(item.media.url);
         return [ mediaId, ext ];
      });


      // delete the media
      const contentColRef      = this.#interaction.client.firestore.collection(`slendyblox`).doc(pageId).collection(`contents`);
      const contentColQuery    = contentColRef.where(`index`, `==`, contentIndex).limit(1);
      const contentQuerySnap   = await contentColQuery.get();
      const [ contentDocSnap ] = contentQuerySnap.docs;
      const mediaColRef        = contentDocSnap.ref.collection(`media`);

      for (const [ mediaId, ext ] of mediaIdsToDelete) {
         const mediaDocRef = mediaColRef.doc(mediaId);
         await this.#interaction.client.firestore.recursiveDelete(mediaDocRef);

         const file = this.#interaction.client.storage.bucket(`mintbubblex-discord`).file(`slendyblox/${mediaId}.${ext}`);
         await file.delete();
      };


      // fetch all other media for this page and update their indexes
      const mediaColQuery  = mediaColRef.orderBy(`at`, `asc`);
      const mediaQuerySnap = await mediaColQuery.get();
      const mediaColDocs   = mediaQuerySnap.docs;

      const batch = this.#interaction.client.firestore.batch();

      for (const [ index, mediaDocSnap ] of mediaColDocs.entries())
         batch.update(mediaDocSnap.ref, { index });

      await batch.commit();


      // show the page that this media was deleted from
      const pagesIndex = await this.getPagesIndex(pageId);

      await this.showPage(pageId, pagesIndex, contentIndex);
   };
};