# Paginate
The `embeds` parameter from the `paginate` function expects an array of embeds. The order does matter: The function will first send the _first_ embed of the array and then switch between them depending on the reaction.\
Now, a few examples on how you could create embeds and use the `paginate` function.
## Examples
```js
const EMBED_COLOR = require('../../config/config.json').EMBED_COLOR;
const { MessageEmbed } = require('discord.js')
const { paginate } = require('../utils/utils')

module.exports = {
    name: "test",
    description: "test command to demonstrate the pagination function",
    execute: async function(client, message, args) {
        const array = []
        for (let i = 0; i < 10; i++) {
            const embed = new MessageEmbed()
            .setTitle('Test Embed')
            .setColor(EMBED_COLOR)
            .setTimestamp()
            .setDescription(i)
            array.push(embed)
        }
        paginate(message, array, { time: 15000 })
    }
}
```
On a side note, if you try something similar yourself and do anything like:
```js
const EMBED_COLOR = require('../../config/config.json').EMBED_COLOR;
const { MessageEmbed } = require('discord.js')
const { paginate } = require('../utils/utils')

module.exports = {
    name: "test",
    description: "test command to demonstrate the pagination function",
    execute: async function(client, message, args) {
        const embed = new MessageEmbed()
        .setTitle('Test Embed')
        .setColor(EMBED_COLOR)
        .setTimestamp()

        const array = []
        for (let i = 0; i < 10; i++) {
            embed.setDescription(i)
            array.push(embed)
        }
        paginate(message, array, { time: 15000 })
    }
}
```
That will not work: All embeds inside `array` will be the same because they are deep copies of `embed`, which means, if you change `embed`, it will change all existing copies of the object.
Another example:
```js
const EMBED_COLOR = require('../../config/config.json').EMBED_COLOR;
const { MessageEmbed } = require('discord.js')
const { paginate } = require('../utils/utils')

module.exports = {
    name: "test",
    description: "test command to demonstrate the pagination function",
    execute: async function(client, message, args) {
        const array = []

        const embed1 = new MessageEmbed()
        .setTitle('Test Embed')
        .setColor('#ff0000')
        .setTimestamp()
        .setDescription('some text')
        array.push(embed1)
        
        const embed2 = new MessageEmbed()
        .setTitle('Test Embed')
        .setColor('#00ff00')
        .setTimestamp()
        .setDescription('some more meaningful text')
        array.push(embed2)

        const embed3 = new MessageEmbed()
        .setTitle('Test Embed')
        .setColor('#0000ff')
        .setTimestamp()
        .setDescription('even more very creative and meaningful text')
        array.push(embed3)
        paginate(message, array)
    }
}
```
That isn't very pretty code, but it works.