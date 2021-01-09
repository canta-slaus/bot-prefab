# 10/01/2021
- To improve the cooldown mechanics (e.g. it would set a cooldown even if they didn't use the command properly):
    - Added `setCooldown()` and `getCooldown()`
    - `setCooldown()` adds a cooldown to a command
    - `getCooldown()` is a helper method to figure out how long the cooldown for that person is (including the custom server cooldowns)
    - Also, all cooldowns now are stored in the client object with `client.serverCooldowns` and `client.globalCooldowns` and updated the main file and the typings
    - Updated the [`message event`](src/eventHandlers/message.ts) to work with the new changes
    - Updated all commands (added a `setCooldown()`)
    - DISCLAIMER: You _have_ to add the `setCooldown()` method to _every_ command (add it where you want the cooldown to be set, e.g. **after** all the command usage checks have been made)
    - Hint: just like in every prefab sided command, just do
    ```ts
    import { setCooldown } = from "./path/to/utils/utils.js";

    //

    setCooldown(client, this, message); // the 'this' points at the very own module.exports, so we're passing in the command we're currently using
    ```
# 09/01/2021
- Added