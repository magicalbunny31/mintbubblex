import Discord from "discord.js";


export const name = Discord.Events.GuildMemberUpdate;


/**
 * @param {import("@mintbubblex-types/client").GuildMember} oldMember
 * @param {import("@mintbubblex-types/client").GuildMember} newMember
 */
export default async (oldMember, newMember) => {
   // this event is for if membership screening is enabled
   if (!newMember.guild.features.includes(Discord.GuildFeature.MemberVerificationGateEnabled))
      return;


   // member just updated / not passed membership screening yet
   if (oldMember.pending === newMember.pending)
      return;


   // get roles to add for this guild
   const roleDocRef  = newMember.client.firestore.collection(`join-roles`).doc(newMember.guild.id);
   const roleDocSnap = await roleDocRef.get();
   const roleDocData = roleDocSnap.data();

   const memberType = !newMember.user.bot ? `members` : `bots`;
   const roles = roleDocData?.[memberType];


   // no roles to add for this memberType/guild
   if (!roles)
      return;


   // add roles to this member
   await newMember.roles.add(roles);
};