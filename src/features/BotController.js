const DiscordJS = require('discord.js');

const { Player } = require('./Player');

const { ChatManager } = require('./ChatManager');

const {
    getFilePath,
} = require('../services/File');


class BotController {
    constructor(PREFIX, whitelist) {
        this._bot = new DiscordJS.Client();
        this._whitelist = whitelist;
        this._PREFIX = PREFIX;

        this._bot.login(process.env.TOKEN);

        this._bot.on('ready', () => {
            this._chatMananger = new ChatManager(this._bot, this, this._whitelist);
        });
    }

    get prefix() {
        return this._PREFIX;
    }

    reactOnCommand(command, voiceChannel, textChannel) {
        switch(command.instruction)  {
            case '$playLocal': 
                const [ fileName ] = command.params;
                const filePath = getFilePath(fileName);

                this._player = new Player(voiceChannel);

                this._player.play(filePath);
            break;

            case '$clear': 
                this._chatMananger.clearChat(textChannel);
            break;

            case '$disconnect': break;

            default: break;
        }
    }
}

module.exports = {
    BotController,
};