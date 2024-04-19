export const name = Discord.Events.MessageCreate;


import Discord from "discord.js";
import { developerCommands } from "@magicalbunny31/fennec-utilities";

/**
 * @param {Discord.Message} message
 */
export default async message =>
   await developerCommands(
      message,
      message.client.fennec,
      JSON.parse(process.env.DEVELOPERS.replaceAll(`'`, `"`))
   );