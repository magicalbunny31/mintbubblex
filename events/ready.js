export const name = Discord.Events.ClientReady;
export const once = true;


import Discord from "discord.js";
import fs from "fs/promises";

import { choice } from "@magicalbunny31/awesome-utility-stuff";

/**
 * @param {Discord.Client} client
 */
export default async client => {
   // commands
   const commands = [];

   for (const file of await fs.readdir(`./interactions/chat-input`))
      commands.push((await import(`../interactions/chat-input/${file}`)).data);

   await client.application.commands.set(commands);


   // log to console once everything is done
   console.log(`uwu~`);
};