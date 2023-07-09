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
      JSON.parse(process.env.DEVELOPERS.replaceAll(`'`, `"`)),
      {
         clientEmail: process.env.FENNEC_GCP_CLIENT_EMAIL,
         privateKey:  process.env.FENNEC_GCP_PRIVATE_KEY,
         projectId:   process.env.FENNEC_GCP_PROJECT_ID
      }
   );