import Slendyblox from "../../classes/slendyblox.js";


/**
 * @param {import("@mintbubblex-types/client").StringSelectMenuInteraction} interaction
 */
export default async interaction => {
   // button info
   const [ _button, subcommand, ...args ] = interaction.customId.split(`:`);
   const [ value ] = interaction.values;

   const slendyblox = new Slendyblox(interaction);


   // what to do based on the subcommand
   switch (subcommand) {


      case `view-page`: {
         // show the page
         const [ rawPagesIndex ] = args;
         const pagesIndex = +rawPagesIndex;

         await slendyblox.showPage(value, pagesIndex);


         // break out
         break;
      };


      case `manage-page`: {
         // what to do based on the command
         const [ pageId, rawContentIndex ] = args;
         const contentIndex = +rawContentIndex;

         switch (value) {


            default: {
               // show the modal for this subcommand
               await slendyblox.showModal(pageId, value, contentIndex);


               // break out
               break;
            };


            case `about-page`: {
               // view information about this page

               await slendyblox.aboutPage(pageId, contentIndex);


               // break out
               break;
            };


            case `delete-page`: {
               // prompt to delete this page content (or the entire page if this is the only page content for this page)
               await slendyblox.promptDeletion(`page`, pageId, contentIndex);


               // break out
               break;
            };


            case `upload-media`: {
               // upload media for this page content
               await slendyblox.awaitMediaInput(pageId, contentIndex);


               // break out
               break;
            };


            case `delete-media`: {
               // select media to delete from this page content
               await slendyblox.selectMediaDeletion(pageId, contentIndex);


               // break out
               break;
            };


         };


         // break out
         break;
      };


      case `delete-media`: {
         // prompt to confirm to delete media from this page content
         const [ pageId, rawContentIndex ] = args;
         const contentIndex = +rawContentIndex;

         await slendyblox.promptDeletion(`media`, pageId, contentIndex, interaction.values);


         // break out
         break;
      };


   };
};