import Discord from "discord.js";
import { Firestore } from "@google-cloud/firestore";
import { Storage } from "@google-cloud/storage";
import { emojis } from "@magicalbunny31/pawesome-utility-stuffs";
import { FennecClient } from "@magicalbunny31/fennec-utilities";


interface ApplicationCommandData {
   guilds?: string[];
   data: Discord.ApplicationCommandData;
};

interface AutocompleteCommandData extends Omit<ApplicationCommandData, "data" | "default"> {
   default: (interaction: AutocompleteInteraction, common: common) => Promise<void>;
};

interface ButtonCommandData extends Omit<ApplicationCommandData, "data" | "default"> {
   default: (interaction: ButtonInteraction, common: common) => Promise<void>;
};

interface ChatInputCommandData extends ApplicationCommandData {
   default: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

interface ModalSubmitCommandData extends Omit<ApplicationCommandData, "data" | "default"> {
   default: (interaction: ModalSubmitInteraction) => Promise<void>;
};

interface AnySelectMenuCommandData extends Omit<ApplicationCommandData, "data" | "default"> {
   default: (interaction: AnySelectMenuInteraction) => Promise<void>;
};


interface Client extends Discord.Client {
   allEmojis: ReturnType<typeof emojis>;
   fennec: FennecClient;
   firestore: Firestore;
   interactions: {
      "autocomplete": Discord.Collection<string, AutocompleteCommandData>;
      "button":       Discord.Collection<string, ButtonCommandData>;
      "chat-input":   Discord.Collection<string, ChatInputCommandData>;
      "modal-submit": Discord.Collection<string, ModalSubmitCommandData>;
      "select-menu":  Discord.Collection<string, AnySelectMenuCommandData>;
   };
   storage: Storage;
};

export interface Interaction extends Discord.Interaction {
   client: Client;
};

export interface AutocompleteInteraction extends Discord.AutocompleteInteraction {
   client: Client;
};

export interface ButtonInteraction extends Discord.ButtonInteraction {
   client: Client;
};

export interface ChatInputCommandInteraction extends Discord.ChatInputCommandInteraction {
   client: Client;
};

export interface ModalSubmitInteraction extends Discord.ModalSubmitInteraction {
   client: Client;
};

export interface AnySelectMenuInteraction extends Discord.AnySelectMenuInteraction {
   client: Client;
};

export interface StringSelectMenuInteraction extends Discord.StringSelectMenuInteraction {
   client: Client;
};

export interface RoleSelectMenuInteraction extends Discord.RoleSelectMenuInteraction {
   client: Client;
};

export interface Message extends Discord.Message {
   client: Client;
};

export interface User extends Discord.User {
   client: Client;
};

export interface GuildMember extends Discord.GuildMember {
   client: Client;
};


export default Client;