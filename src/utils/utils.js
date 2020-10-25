module.exports = class Util {
    static processArguments(message, expectedArgs, msgArgs) {
        for (const argument of expectedArgs) {
            console.log(argument)
        }
    }
}