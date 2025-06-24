import Discord from "discord.js";


export const name = Discord.Events.GuildMemberAdd;


/**
 * @param {import("@mintbubblex-types/client").GuildMember} member
 */
export default async member => {
   // this event is for if membership screening is disabled (and if this user isn't a bot)
   if (member.guild.features.includes(Discord.GuildFeature.MemberVerificationGateEnabled) && !member.user.bot)
      return;


   // get roles to add for this guild
   const roleDocRef  = member.client.firestore.collection(`join-roles`).doc(member.guild.id);
   const roleDocSnap = await roleDocRef.get();
   const roleDocData = roleDocSnap.data();

   const memberType = !member.user.bot ? `members` : `bots`;
   const roles = roleDocData?.[memberType];


   // no roles to add for this memberType/guild
   if (!roles)
      return;


   // add roles to this member
   await member.roles.add(roles);
};