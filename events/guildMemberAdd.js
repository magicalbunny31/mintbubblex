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


   // this is a bot
   if (member.user.bot)
      return;


   // add the unverified role to this member
   return await member.roles.add(process.env.ROLE_UNVERIFIED);
};