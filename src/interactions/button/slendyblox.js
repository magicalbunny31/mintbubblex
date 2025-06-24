import Slendyblox from "../../classes/slendyblox.js";


/**
 * @param {import("@mintbubblex-types/client").ButtonInteraction} interaction
 */
export default async interaction => {
   // button info
   const [ _button, subcommand, pageId, ...args ] = interaction.customId.split(`:`);

   const slendyblox = new Slendyblox(interaction);


   // what to do based on the subcommand
   switch (subcommand) {


      default: {
         // re-open a modal
         const [ rawContentIndex ] = args;
         const contentIndex = +rawContentIndex || undefined;

         await slendyblox.showModal(pageId, subcommand, contentIndex);

         // break out
         break;
      };


      case `view-page`: {
         // show the page
         const [ rawPagesIndex, rawContentIndex, rawShowManagePagesOptions ] = args;
         const pagesIndex             = +rawPagesIndex   || undefined; // NaN isn't nullable for default parameters for the slendyblox.showPage argument below
         const contentIndex           = +rawContentIndex || undefined; // see above
         const showManagePagesOptions = rawShowManagePagesOptions === `true`;

         await slendyblox.showPage(pageId, pagesIndex, contentIndex, showManagePagesOptions);


         // break out
         break;
      };


      case `delete-page`: {
         // delete this page content (or the entire page if this is the only page content for this page)
         const [ rawContentIndex ] = args;
         const contentIndex = +rawContentIndex;

         await slendyblox.deletePage(pageId, contentIndex);


         // break out
         break;
      };


      case `upload-media`: {
         // upload media for this page content
         const [ rawContentIndex ] = args;
         const contentIndex = +rawContentIndex;

         await slendyblox.awaitMediaInput(pageId, contentIndex);


         // break out
         break;
      };


      case `delete-media`: {
         // delete this media
         const [ rawContentIndex ] = args;
         const contentIndex = +rawContentIndex;

         await slendyblox.deleteMedia(pageId, contentIndex);


         // break out
         break;
      };


   };
};