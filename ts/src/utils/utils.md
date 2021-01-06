# Available features

- Command arguments and other command properties
- Pagination
- Global user blacklisting/whitelisting
- randomRange, delay, getReply, ...

## Command arguments

In the message event, I use an ominous function: `processArguments()`. It _processes_ the given arguments and helps reduce duplicate code.

### Examples

E.g.: If you are making a command that requires the user to pass in a number, simply add

```ts
arguments: [
  {
    type: ArgumentType.NUMBER,
    prompt: "Please enter a valid number",
  },
];
```

to your command and the function will take care of the rest. Make sure you import `ArgumentType` from `utils.ts`. If the user didn't provide a number, it will send a message as defined in the `prompt` and won't execute the command. If they do send a valid number, it will continue. The order of the arguments will be kept, that is:

```ts
export default {
  name: "test",
  description: "Test command to demonstrate the arguments property.",
  arguments: [
    {
      type: ArgumentType.NUMBER,
      prompt: "Please enter a valid number.",
    },
    {
      type: ArgumentType.NUMBER,
      prompt: "Please enter a valid number.",
    },
    {
      type: ArgumentType.STRING,
      prompt: "Please enter an operation.",
    },
  ],
  async execute(client, message, args) {
    console.log(args);
  },
} as Command;
```

If they do `test 1 2 add`, it will log `[ 1, 2, 'add' ].`\
To add your and/or other users ID's as a dev (for the `devOnly` property), add their ID's as a string inside the array `dev` in `config/config.json`. Same goes for `someServersOnly`.
All available types and many more command properties can be seen in [`src/utils/prefab.ts`](src/utils/prefab.ts).

## Pagination

First, require the function `paginate` defined in [`src/utils/utils.ts`](src/utils/utils.ts). The function requires two parameters: `message` and `embeds`.\
`message`: just the message object _(to send the paginated message, get the author to listen to the reactions to, etc.)_.\
`embeds`: an array of embed objects. Yes, a MessageEmbed is a plain old JavaScript object.\
The function also has an optional parameter `optional`: `optional = { time: maxTimeInMs }` _default time: 30000ms_
The `embeds` parameter from the `paginate` function expects an array of embeds. The order does matter: The function will first send the _first_ embed of the array and then switch between them depending on the reaction.\
Now, a few examples on how you could create embeds and use the `paginate` function.

### Examples

```ts
import { EMBED_COLOR } from "../../config.json";
import { MessageEmbed } from "discord.js";
import { paginate } from "../../utils";

export default {
  name: "test",
  description: "test command to demonstrate the pagination function",
  async execute(client, message, args) {
    const array = [];
    for (let i = 0; i < 10; i++) {
      const embed = new MessageEmbed()
        .setTitle("Test Embed")
        .setColor(EMBED_COLOR)
        .setTimestamp()
        .setDescription(i);
      array.push(embed);
    }
    paginate(message, array, { time: 15000 });
  },
} as Command;
```

On a side note, if you try something similar yourself and do anything like:

```ts
import { EMBED_COLOR } from "../../config.json";
import { MessageEmbed } from "discord.js";
import { paginate } from "../../utils";

export default {
  name: "test",
  description: "test command to demonstrate the pagination function",
  async execute(client, message, args) {
    const embed = new MessageEmbed()
      .setTitle("Test Embed")
      .setColor(EMBED_COLOR)
      .setTimestamp();

    const array = [];
    for (let i = 0; i < 10; i++) {
      embed.setDescription(i);
      array.push(embed);
    }
    paginate(message, array, { time: 15000 });
  },
} as Command;
```

That will not work: All embeds inside `array` will be the same because they are deep copies of `embed`, which means, if you change `embed`, it will change all existing copies of the object.
Another example:

```ts
import { EMBED_COLOR } from "../../config.json";
import { MessageEmbed } from "discord.js";
import { paginate } from "../../utils";

export default {
  name: "test",
  description: "test command to demonstrate the pagination function",
  async execute(client, message, args) {
    const array = [];

    const embed1 = new MessageEmbed()
      .setTitle("Test Embed")
      .setColor("#ff0000")
      .setTimestamp()
      .setDescription("some text");
    array.push(embed1);

    const embed2 = new MessageEmbed()
      .setTitle("Test Embed")
      .setColor("#00ff00")
      .setTimestamp()
      .setDescription("some more meaningful text");
    array.push(embed2);

    const embed3 = new MessageEmbed()
      .setTitle("Test Embed")
      .setColor("#0000ff")
      .setTimestamp()
      .setDescription("even more very creative and meaningful text");
    array.push(embed3);
    paginate(message, array);
  },
} as Command;
```

That isn't very pretty code, but it works.

## How to blacklist/whitelist users

A blacklisted user will not be able to use any command from your bot and will be totally ignored.\
To blacklist someone, simply require the functions `blacklist, whitelist` defined in [`src/utils/utils.ts`](src/utils/utils.ts).

### Examples

```ts
import { blacklist } from "../../utils";

export default {
  name: "blacklist",
  description: "blacklist a user",
  async execute(client, message, args) {
    blacklist(client, message.mentions.users.first());
  },
} as Command;
```

It's that easy.

## Misc. functions

### getReply()

First, require the function `getReply` defined in [`src/utils/utils.js`](src/utils/utils.js). The function requires one parameters: `message`.\
`message`: just the message object _(to listen to messages, get the author to listen to the messages to, etc.)_.\
The function also has an optional parameter `optional`:

```ts
{
    time: number, // max time in ms, default: 30000
    user: user, // the user to listen to messages to, default: message.author
    words: string[] // array with strings of accepted words, default: [] (all words will be accepted)
}
```

This function helps you await a users reply. Let's say you have a quiz command and want to see what the user replied, you could use this function to reduce duplicate code:

```ts
import { getReply } from "../../utils";

export default {
  name: "test",
  description: "Test command to demonstrate `getReply()`",

  async execute(client, message, args) {
    message.channel.send("Are you sure?");
    const reply = await getReply(message, {
      time: 10000,
      words: ["yes", "y", "n", "no"],
    });
    if (["yes", "y"].includes(reply.content.toLowerCase()))
      message.channel.send(`${message.author.username} is sure about that.`);
    else
      message.channel.send(
        `${message.author.username} isn't so sure about that.`
      );
  },
} as Command
```

### Misc.

`randomRange(min, max)`

```ts
const random = randomRange(10, 20);
console.log(random);
```

`delay(ms)`

```ts
await delay(ms);
```