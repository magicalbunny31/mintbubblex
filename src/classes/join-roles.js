import Discord from "discord.js";
import { FieldValue } from "@google-cloud/firestore";


export default class JoinRoles {
   constructor(interaction) {
      this.#interaction = interaction;
   };


   /**
    * @type {import("@mintbubblex-types/client").ChatInputCommandInteraction | import("@mintbubblex-types/client").StringSelectMenuInteraction}
    */
   #interaction;


   get #roleDocRef() {
      return this.#interaction.client.firestore.collection(`join-roles`).doc(this.#interaction.guildId);
   };


   /**
    * @param {"members" | "bots"} memberType
    * @returns {Promise<Discord.Snowflake[]>}
    */
   async #getJoinRoles(memberType) {
      const roleDocSnap = await this.#roleDocRef.get();
      const roleDocData = roleDocSnap.data();
      const roles = roleDocData?.[memberType] ?? [];
      return roles;
   };


   /**
    * @param {"members" | "bots"} memberType
    * @param {Discord.Role[]} roles
    * @returns {Promise<void>}
    */
   async #setJoinRoles(memberType, roles) {
      const formattedRoles = roles
         .filter(role =>
            !role.tags?.availableForPurchase
            && !role.tags?.botId
            && !role.tags?.guildConnections
            && !role.tags?.integrationId
            && !role.tags?.premiumSubscriberRole
            && !role.tags?.subscriptionListingId
         )
         .map(role => role.id);


      // set the join roles for this memberType
      const roleDocSnap = await this.#roleDocRef.get();

      const data = {
         [memberType]: formattedRoles.length
            ? formattedRoles
            : FieldValue.delete()
      };

      if (roleDocSnap.exists)
         await this.#roleDocRef.update(data);
      else
         await this.#roleDocRef.set(data);
   };


   /**
    * @param {"members" | "bots"} [memberType="members"]
    */
   async showMenu(memberType = `members`) {
      // get join roles for this guild
      const roles = await this.#getJoinRoles(memberType);


      // components
      const components = [
         new Discord.TextDisplayBuilder()
            .setContent(
               [
                  Discord.heading(`${this.#interaction.client.allEmojis.shield} Select up to 25 roles to give to new ${memberType === `members` ? `people` : `bots`} who join this server`, Discord.HeadingLevel.Three),
                  `When no roles are selected, ${this.#interaction.client.user} won't give roles to new ${memberType === `members` ? `people` : `bots`} who join this server.`,
                  `Purchasable roles, integration roles, linked roles, and subscriber roles won't be saved if selected.`
               ]
                  .join(`\n`)
            ),

         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.StringSelectMenuBuilder()
                  .setCustomId(`join-roles`)
                  .setPlaceholder(`Select a member type`)
                  .setOptions(
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`people`)
                        .setValue(`members`)
                        .setEmoji(this.#interaction.client.allEmojis.person)
                        .setDefault(memberType === `members`),
                     new Discord.StringSelectMenuOptionBuilder()
                        .setLabel(`bots`)
                        .setValue(`bots`)
                        .setEmoji(this.#interaction.client.allEmojis.bot)
                        .setDefault(memberType === `bots`)
                  )
            ),

         new Discord.ActionRowBuilder()
            .setComponents(
               new Discord.RoleSelectMenuBuilder()
                  .setCustomId(`join-roles:${memberType}`)
                  .setPlaceholder(`Select the roles to give to new ${memberType === `members` ? `people` : `bots`}`)
                  .setMinValues(0)
                  .setMaxValues(25)
                  .setDefaultRoles(roles)
            )
      ];


      // reply to the interaction
      const payload = {
         components,
         flags: [
            ...this.#interaction.isChatInputCommand()
               ? [ Discord.MessageFlags.Ephemeral ]
               : [],
            Discord.MessageFlags.IsComponentsV2
         ]
      };

      if (this.#interaction.isChatInputCommand())
         await this.#interaction.reply(payload);
      else
         await this.#interaction.update(payload);
   };


   /**
    * @param {"members" | "bots"} memberType
    * @param {Discord.Role[]} roles
    */
   async updateJoinRoles(memberType, roles) {
      // set the join roles for this memberType
      await this.#setJoinRoles(memberType, roles);


      // update the menu
      await this.showMenu(memberType);
   };
};