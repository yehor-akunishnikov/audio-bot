require("dotenv").config();

const MediaSplit = require('media-split');
const Downloader = require('downloader.js');

const folder = new Downloader('dist');

const { BotController } = require('./features/BotController');

const PREFIX = '$';

const bot = new BotController(PREFIX, ['bot-test']);

module.exports = {
    Downloader,
    MediaSplit,
    folder,
};