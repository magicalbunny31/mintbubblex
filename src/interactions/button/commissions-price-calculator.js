import CommissionsPriceCalculator from "../../classes/commissions-price-calculator.js";


/**
 * @param {import("@mintbubblex-types/client").ButtonInteraction} interaction
 */
export default async interaction => {
   // button info
   const [ _button, subcommandOrWholeBitField, rawWholeBitField ] = interaction.customId.split(`:`);

   const wholeBitField = +rawWholeBitField;

   const commissionsPriceCalculator = new CommissionsPriceCalculator(interaction);


   // what to do based on the subcommand
   switch (subcommandOrWholeBitField) {


      default: {
         // show the calculator
         const wholeBitField = +subcommandOrWholeBitField;
         await commissionsPriceCalculator.showCalculator(wholeBitField);


         // break out
         break;
      };


      case `view-posters`: {
         // show the posters
         await commissionsPriceCalculator.showPosters(wholeBitField);


         // break out
         break;
      };


      case `view-examples`: {
         // show the art examples
         await commissionsPriceCalculator.showExamples(wholeBitField);


         // break out
         break;
      };


   };
};