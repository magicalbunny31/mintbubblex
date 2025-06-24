import Fox from "../../classes/fox.js";


/**
 * @param {import("@mintbubblex-types/client").ButtonInteraction} interaction
 */
export default async interaction => {
   // button info
   const [ _button ] = interaction.customId.split(`:`);


   // show a fox
   const fox = new Fox(interaction);
   await fox.showFox();
};