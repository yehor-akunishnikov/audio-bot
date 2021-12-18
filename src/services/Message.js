const checkIsWhitelisted = (whitelist, channelName) => 
    whitelist.some(whitelistChannel => whitelistChannel === channelName);

const checkIsCommand = (text, PREFIX) => text.startsWith(PREFIX);

module.exports = {
    checkIsWhitelisted,
    checkIsCommand,
};