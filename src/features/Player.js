class Player {
    constructor(voiceChannel) {
        this._voiceChannel = voiceChannel;
    }

    async play(filePath) {
        console.log(filePath);
    }
}

module.exports = {
    Player,
};