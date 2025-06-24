import JoinRoles from "../../classes/join-roles.js";


/**
 * @param {import("@mintbubblex-types/client").StringSelectMenuInteraction | import("@mintbubblex-types/client").RoleSelectMenuInteraction} interaction
 */
export default async interaction => {
   // select menu info
   const [ _selectMenu, memberType ] = interaction.customId.split(`:`);


   // the join roles class
   const joinRoles = new JoinRoles(interaction);


   if (interaction.isStringSelectMenu()) { // update the menu
      const [ memberType ] = interaction.values;
      await joinRoles.showMenu(memberType);


   } else { // update join roles then update the menu
      const roles = interaction.roles;
      await joinRoles.updateJoinRoles(memberType, roles);
   };
};