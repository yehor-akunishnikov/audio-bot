const DiscordJS = require('discord.js');

const { 
    checkIsWhitelisted,
    checkIsCommand,
} = require('../services/Message');


class Bot {
    constructor(PREFIX, whitelist) {
        this.bot = new DiscordJS.Client();
        this._whitelist = whitelist;
        this._PREFIX = PREFIX;

        this.bot.login(process.env.TOKEN);

        this.bot.on('message', (message) => {
            this._reactOnMessage(message);
        })
    }

    _reactOnMessage(message) {
        let command;

        const { channel } = message;

        //Checks
        const isCommand = checkIsCommand(message.content, this._PREFIX);
        const isWhitelistedChannel = checkIsWhitelisted(this._whitelist, channel.name);

        if(isWhitelistedChannel && isCommand) {
            command = message.content;

            switch(command)  {
                case '$playLocal': 
                    console.log('playLocal');
                break;

                case '$playRemote': 
                    console.log('playRemote');
                break;

                case '$disconnect': break;

                default: break;
            }
        }
    }
}

module.exports = {
    Bot,
};