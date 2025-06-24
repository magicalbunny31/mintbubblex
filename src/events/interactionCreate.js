import path from "node:path";
import Discord from "discord.js";
import chalk from "chalk";
import { colours, respondToErrorInteraction } from "@magicalbunny31/pawesome-utility-stuffs";


export const name = Discord.Events.InteractionCreate;


/**
 * @param {import("@mintbubblex-types/client").Interaction} interaction
 */
export default async interaction => {
   // get this interaction's file
   const type = (() => {
      switch (true) {
         case interaction.isAutocomplete():     return `autocomplete`;
         case interaction.isButton():           return `button`;
         case interaction.isChatInputCommand(): return `chat-input`;
         case interaction.isModalSubmit():      return `modal-submit`;
         case interaction.isAnySelectMenu():    return `select-menu`;
      };
   })();

   const name = (() => {
      switch (type) {
         case `autocomplete`:
         case `chat-input`:
            return interaction.commandName;
         case `button`:
         case `modal-submit`:
         case `select-menu`:
            return interaction.customId.split(`:`)[0];
      };
   })();

   const file = interaction.client.interactions[type]?.get(name);

   if (!file)
      return;


   try {
      // run this interaction
      await file.default(interaction);


   } catch (error) {
      // log this caught error
      const cwd = process.cwd();
      const file = import.meta.filename;
      const location = path.relative(cwd, file);

      console.error(chalk.hex(colours.mintbubblex)(`~ caught error in ${location}! see below for the error..`));
      console.line(error.stack ?? error ?? `no error..?`);

      try {
         const source = `${Discord.inlineCode(type)}/${Discord.inlineCode(name)}`;
         await interaction.client.fennec.postErrorLog(error, source, interaction.createdAt, interaction.id);
      } catch (error) {
         console.error(chalk.hex(colours.mintbubblex)(`~ ..the error handler failed to log this caught error in ${location}! see below for its error..`));
         console.line(error.stack ?? error ?? `no error..?`);
      };

      try {
         await respondToErrorInteraction(interaction, `https://nuzzles.dev/discord`, error);
      } catch (error) {
         console.error(chalk.hex(colours.fox_kit)(`~ ..the error user response failed to log this caught error in ${location}! see below for its error..`));
         console.line(error.stack ?? error ?? `no error..?`);
      };
   };
};