import CommissionsPriceCalculator from "../../classes/commissions-price-calculator.js";


/**
 * @param {import("@mintbubblex-types/client").StringSelectMenuInteraction} interaction
 */
export default async interaction => {
   // select menu info
   const [ _selectMenu, feature, rawOldWholeBitField ] = interaction.customId.split(`:`);
   const values = interaction.values;

   const oldWholeBitField = +rawOldWholeBitField;


   // show the calculator
   const commissionsPriceCalculator = new CommissionsPriceCalculator(interaction);
   const wholeBitField = commissionsPriceCalculator.getBitField(oldWholeBitField, feature, values);
   await commissionsPriceCalculator.showCalculator(wholeBitField);
};