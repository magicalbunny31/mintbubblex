import Slendyblox from "../../classes/slendyblox.js";


/**
 * @param {import("@mintbubblex-types/client").ModalSubmitInteraction} interaction
 */
export default async interaction => {
   // modal info
   const [ _button, subcommand, pageId, ...args ] = interaction.customId.split(`:`);

   const slendyblox = new Slendyblox(interaction);


   // function to get a component's value
   const getValue = customId =>
      interaction.fields.components.find(component => component.components[0].customId === customId)?.components[0].value; // using `interaction.fields.getTextInputValue` will throw if a field with the specified customId doesn't exist - this function doesn't


   // what to do based on the subcommand
   switch (subcommand) {


      case `create-page`:
      case `create-page-content`: {
         // create a (new) page
         const name        = getValue(`name`);
         const description = getValue(`description`);
         const pageContent = getValue(`page-content`);

         await slendyblox.createPage(pageId, name, description, pageContent);


         // break out
         break;
      };


      case `update-page`: {
         // update a page
         const name        = getValue(`name`);
         const description = getValue(`description`);

         await slendyblox.updatePage(pageId, name, description);


         // break out
         break;
      };


      case `update-page-content`: {
         // update a page's content
         const [ rawContentIndex ] = args;
         const contentIndex = +rawContentIndex;

         const pageContent = getValue(`page-content`);

         await slendyblox.updatePageContent(pageId, contentIndex, pageContent);


         // break out
         break;
      };


   };
};