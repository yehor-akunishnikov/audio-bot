const mp3d = require('mp3-duration');

const getFilePath = (filename) => `dist/${filename}.mp3`;

const formatDuration = (seconds) => {
    const hour = Math.floor(seconds / 60 / 60);
    const min = Math.floor(seconds / 60) - (hour * 60);
    const sec = Math.ceil(seconds % 60);

    return { hour, min, sec };
}

const getDuration = async(filePath) => {
    let duration;

    try {
        duration = await mp3d(filePath);
    } catch(e) {
        throw e;
    }

    return formatDuration(duration);
}

module.exports = {
    getFilePath,
    getDuration,
};