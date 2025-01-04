import Discord from "discord.js";

/**
 * @param {Discord.AnySelectMenuInteraction} interaction
 */
export default async interaction => {
   // select menu info
   const [ _selectMenu, feature ] = interaction.customId.split(`:`);
   const values = interaction.values;


   // set the selected value(s) as default in its select menu
   const components = interaction.message.components;

   const selectMenuIndex = components.flat().findIndex(({ components }) => components[0].customId === interaction.customId);
   const selectedValuesIndexes = values.map(value => components[selectMenuIndex].components[0].options.findIndex(option => option.value === value));

   for (const option of components[selectMenuIndex].components[0].options)
      option.default = false;

   for (const index of selectedValuesIndexes)
      components[selectMenuIndex].components[0].options[index].default = true;


   // edit select menus based on what feature was selected
   if (feature === `base-style`) {
      components[2].components[0].data.placeholder = `Select a position...`;
      components[2].components[0].data.disabled = false;
   };

   if (feature === `position`) {
      components[3].components[0].data.placeholder = `Select extras...`;
      components[3].components[0].data.disabled = false;
   };


   // add/remove options from the select menus depending on what was chosen
   const characters = +components[0].components[0].options.find  (option => option.default)                     .value;
   const baseStyle  =  components[1].components[0].options.find  (option => option.default)                    ?.value;
   const position   =  components[2].components[0].options.find  (option => option.default)                    ?.value;
   const extras     =  components[3].components[0].options.filter(option => option.default).map(option => option.value);

   if (baseStyle === `line-art`) {
      components[3].components[0].data.max_values = 2;
      components[3].components[0].options.splice(1, 1);

   } else {
      components[3].components[0].data.max_values = 3;
      components[3].components[0].options.splice(1, 1,
         new Discord.StringSelectMenuOptionBuilder()
            .setLabel(`Complicated Background`)
            .setValue(`complicated-background`)
            .setDefault(extras.includes(`complicated-background`))
      );
   };

   if (characters === 1 && baseStyle !== `shade` && position === `head-bust`) {
      components[3].components[0].data.max_values = baseStyle === `line-art` ? 2 : 3;
      components[3].components[0].options.splice(baseStyle === `line-art` ? 1 : 2, 1,
         new Discord.StringSelectMenuOptionBuilder()
            .setLabel(`Animated GIF`)
            .setDescription(`Line Art or ${interaction.locale === Discord.Locale.EnglishUS ? `Color` : `Colour`}ed + Head Bust only.`)
            .setValue(`head-bust-animated-gif`)
            .setDefault(extras.includes(`head-bust-animated-gif`))
      );

   } else {
      components[3].components[0].data.max_values = baseStyle === `line-art` ? 1 : 2;
      components[3].components[0].options.splice(baseStyle === `line-art` ? 1 : 2, 1);
   };


   // calculate the price for this commission
   let price = 0;

   if (baseStyle === `line-art`) {
      switch (true) {
         case position === `head-bust`:  price += 310; break;
         case position === `waist`:      price += 380; break;
         case position === `whole-body`: price += 440; break;
      };

   } else if (baseStyle === `coloured`) {
      switch (true) {
         case position === `head-bust`:  price += 390; break;
         case position === `waist`:      price += 450; break;
         case position === `whole-body`: price += 500; break;
      };

   } else if (baseStyle === `shade`) {
      switch (true) {
         case position === `head-bust`:  price += 750; break;
         case position === `waist`:      price += 830; break;
         case position === `whole-body`: price += 990; break;
      };
   };

   price *= characters;

   if (characters >= 4)
      price *= .85;
   else if (characters >= 3)
      price *= .9;

   if (extras.includes(`coloured-line-arts`))
      price += 40;

   if (extras.includes(`complicated-background`))
      price += 400;

   if (extras.includes(`head-bust-animated-gif`))
      price += 5000;

   if ((characters > 1 || baseStyle === `shade` || position !== `head-bust`) && extras.includes(`head-bust-animated-gif`))
      price -= 5000;


   // whether the price can be shown because the user hasn't selected all possible combinations yet
   const canShowPrice = !components[3].components[0].data.disabled;


   // selected features
   const features = [
      ...baseStyle === `line-art` ? [ `Line art only` ]                 : [],
      ...baseStyle === `coloured` ? [ `Coloured drawing` ]              : [],
      ...baseStyle === `shade`    ? [ `Coloured drawing with shading` ] : [],

      ...extras.includes(`coloured-line-arts`) ? [ `Line art will be coloured` ] : [],
      ...extras.includes(`complicated-background`) ? [ `Complex background` ] : []
   ];

   const discounts = [
      ...characters === 3 ? [ `10% off price of characters` ] : [],
      ...characters === 4 ? [ `15% off price of characters` ] : [],
      ...characters === 5 ? [ `15% off price of characters` ] : [],

      ...baseStyle === `line-art` ? [ `FREE complex background` ] : [],
      ...baseStyle === `coloured` ? [ `FREE simple background` ]  : []
   ];


   // embeds
   const embeds = [
      new Discord.EmbedBuilder()
         .setColor(Discord.Colors.Blue)
         .setFields({
            name: `Price`,
            value: `\`R$ ${canShowPrice ? Math.round(price) : `---`}\``,
            inline: true
         }, {
            name: `Selected Features`,
            value: features
               .map(feature => `- ${feature}`)
               .join(`\n`)
               || `\u200b`,
            inline: true
         }, {
            name: `Discounts`,
            value: discounts
               .map(feature => `- ${feature}`)
               .join(`\n`)
               || `\u200b`,
            inline: true
         })
         .setFooter({
            text: `❗ All prices are estimations.`
         })
   ];


   // update the interaction
   return await interaction.update({
      embeds,
      components
   });
};