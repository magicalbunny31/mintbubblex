import JoinRoles from "../../classes/join-roles.js";

import Discord from "discord.js";


export const data = new Discord.SlashCommandBuilder()
   .setName(`join-roles`)
   .setDescription(`Manage roles to add to members who join this server`)
   .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
   .setContexts(Discord.InteractionContextType.Guild)
   .setIntegrationTypes(Discord.ApplicationIntegrationType.GuildInstall);


/**
 * @param {import("@mintbubblex-types/client").ChatInputCommandInteraction} interaction
 */
export default async interaction => {
   // show the menu
   const joinRoles = new JoinRoles(interaction);
   await joinRoles.showMenu();
};