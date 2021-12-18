const checkIsWhitelisted = (whitelist, channelName) => 
    whitelist.some(whitelistChannel => whitelistChannel === channelName);

const checkIsCommand = (text, PREFIX) => text.startsWith(PREFIX);

const splitCommand = (command) => {
    const [instruction, ...params] = command.split(' ');

    return {
        instruction,
        params,
    };
}

module.exports = {
    checkIsWhitelisted,
    checkIsCommand,
    splitCommand,
};