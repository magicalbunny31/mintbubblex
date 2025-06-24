/**
 * 🍭 Mint
 * 👥 magicalbunny31 (https://nuzzles.dev)
 * 🗓️ 2022 - 2025
 * 🏡 https://nuzzles.dev/dev/mintbubblex
 * 🔗 https://nuzzles.dev/dev/mintbubblex/github
 */


// environment variables
import dotenv from "@dotenvx/dotenvx";
dotenv.config({ path: `./src/.env`, envKeysFile: `./src/.env.keys` });


// logging
import logger from "better-logging";
import chalk from "chalk";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(duration);
dayjs.extend(relativeTime);

logger(console, {
   format: ctx => {
      const date = dayjs().format(`[[]HH:mm:ss] [[]DD-MMM-YYYY]`);
      return `${chalk.grey(date)} ${chalk.bold(ctx.type)} ${ctx.msg}`;
   }
});

console.logLevel = 4;


// pawesome logs
import fs from "node:fs/promises";
import { colours } from "@magicalbunny31/pawesome-utility-stuffs";

const logColours = [
   colours.red, colours.orange, colours.yellow, colours.green, colours.blue, colours.purple
];

const splash = (await fs.readFile(`./src/assets/splash.txt`)).toString();

for (const [ index, line ] of splash.split(/\r?\n/).entries())
   console.line(chalk.hex(logColours[index])(line));


// the discord client
import Discord from "discord.js";

const client = new Discord.Client({
   intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMembers,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.MessageContent
   ],

   presence: {
      status: Discord.PresenceUpdateStatus.Online,
      activities: [{
         name: `over the crew`,
         type: Discord.ActivityType.Watching
      }]
   }
});

await client.login(process.env.TOKEN);


// database
import { Firestore } from "@google-cloud/firestore";

client.firestore = new Firestore({
   credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY
   },
   databaseId: `mintbubblex-discord`,
   projectId: process.env.GCP_PROJECT_ID,
   ssl: true
});

import { Storage } from "@google-cloud/storage";

client.storage = new Storage({
   credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY
   },
   projectId: process.env.GCP_PROJECT_ID
});


// fennec
import { FennecClient } from "@magicalbunny31/fennec-utilities";

client.fennec = new FennecClient({
   fennecProcess: `fox-1`,
   fennecUtilities: {
      baseUrl:       process.env.FENNEC_UTILITIES_URL,
      id:            `mintbubblex`,
      authorisation: process.env.FENNEC_UTILITIES_AUTHORISATION
   }
});

await client.fennec.initialise();


// emojis
import { emojis } from "@magicalbunny31/pawesome-utility-stuffs";

client.allEmojis = emojis(await client.application.emojis.fetch());


// discord application commands
import { partition, set } from "@magicalbunny31/pawesome-utility-stuffs";

client.interactions = {};
for (const interaction of await fs.readdir(`./src/interactions`))
   client.interactions[interaction] = new Discord.Collection();

for (const interaction of await fs.readdir(`./src/interactions`)) {
   const interactions = await fs.readdir(`./src/interactions/${interaction}`);

   for (const file of interactions) {
      const [ name ] = file.split(`.`);
      const data = await import(`./interactions/${interaction}/${file}`);
      client.interactions[interaction].set(name, data);
   };
};

const [ globalCommands, guildCommands ] = partition(
   [
      ...client.interactions[`chat-input`].values()
   ],
   command => !command.guilds
);

const globalCommandsData  = globalCommands.map(command => command.data);
const guildCommandsGuilds = set(guildCommands.flatMap(command => command.guilds));

for (const guildId of guildCommandsGuilds)
   await client.application.commands.set(
      guildCommands
         .filter(command => command.guilds.includes(guildId))
         .map(command => command.data),
      guildId
   );

await client.application.commands.set(globalCommandsData);


// discord client events
const events = await fs.readdir(`./src/events`);

for (const file of events) {
   const event = await import(`./events/${file}`);
   if (!event.once) client.on  (event.name, async (...args) => await event.default(...args));
   else             client.once(event.name, async (...args) => await event.default(...args));
};


// process events
process.on("uncaughtException", async (error, origin) => {
   console.error(chalk.hex(colours.mintbubblex)(`~ uncaught exception! see below for the error..`));
   console.line(error.stack ?? error ?? `no error..?`);

   try {
      const source = `${Discord.inlineCode(origin)}`;
      await client.fennec.postErrorLog(error, source, new Date());
   } catch (error) {
      console.error(chalk.hex(colours.mintbubblex)(`~ ..the error handler failed to log this uncaught exception! see below for its error..`));
      console.line(error.stack ?? error ?? `no error..?`);
   } finally {
      console.error(chalk.hex(colours.mintbubblex)(`~ killing process..`));
      process.exit(1);
   };
});


// final logs
const guildCount = client.guilds.cache.size;
const tag = client.user.tag;

console.debug(chalk.hex(colours.mintbubblex)(`logged in as @${tag} with ${guildCount} ${guildCount === 1 ? `guild` : `guilds`}`));


// miscellaneous lines below !!