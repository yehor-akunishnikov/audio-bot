const { 
    checkIsWhitelisted,
    checkIsCommand,
    splitCommand,
} = require('../services/Message');

class ChatManager {
    constructor(bot, botController, whitelist) {
        this._bot = bot;
        this._botController = botController;

        this._bot.on('message', (message) => this._reactOnMessage(message, whitelist));
    }

    _reactOnMessage(message, whitelist) {
        let command;

        const { channel: textChannel } = message;
        const voiceChannel = message.member.voice ? message.member.voice.channel : null;

        //Checks
        const isCommand = checkIsCommand(message.content, this._botController.prefix);
        const isWhitelistedChannel = checkIsWhitelisted(whitelist, textChannel.name);

        if(isCommand && isWhitelistedChannel) {
            command = splitCommand(message.content);

            this._botController.reactOnCommand(command, voiceChannel, textChannel);
        }
    }

    showError(error, textChannel) {
        const errorMessage = error.cause.message;

        textChannel.send(errorMessage);
    }

    clearChat(textChannel) {
        textChannel.bulkDelete(100, true);
    }
}

module.exports = {
    ChatManager,
};