import Slendyblox from "../../classes/slendyblox.js";

import { findSimilar } from "@magicalbunny31/pawesome-utility-stuffs";


/**
 * @param {import("@mintbubblex-types/client").AutocompleteInteraction} interaction
 */
export default async interaction => {
   // options
   const { name: option, value: input } = interaction.options.getFocused(true);


   // what to do for this option
   switch (option) {


      case `page`: {
         // get pages
         const slendyblox = new Slendyblox(interaction);
         const pages = await slendyblox.getPages();


         // format the pages into options
         const pagesOptions = pages.map(page =>
            ({
               name: page.name,
               value: page.id
            })
         );


         // no input, return the first 25 entries
         if (!input)
            return await interaction.respond(
               pagesOptions.slice(0, 25)
            );


         // sort these pages based on the input and respond to the interaction
         const sortedPages = findSimilar(
            input,
            pagesOptions,
            { key: `name`, limit: 25, minScore: 0.01 }
         )
            .map(({ object }) => object);

         await interaction.respond(sortedPages);


         // break out
         break;
      };


   };
};