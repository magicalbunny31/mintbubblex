import { Snowflake } from "discord.js";
import { Timestamp } from "@google-cloud/firestore";


interface Page {
   description: string?;
   name: string;
};

export interface PageWithId extends Page {
   id: string;
};


interface Content {
   content: string;
   index:   number;
};

export interface PageContent extends Content {
   media: Media[];
};


interface Change {
   at:     Timestamp;
   author: Snowflake;
};

export type PageChange = Change & Page;

export interface PageContentChange extends Change {
   content: string;
};


interface Media {
   at:     Timestamp;
   index:  number;
   type:   string;
   url:    string;
};