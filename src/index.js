require("dotenv").config();

const MediaSplit = require('media-split');
const mp3d = require('mp3-duration');
const Downloader = require('downloader.js');

const folder = new Downloader('dist');

const { Bot } = require('./features/Bot');

const PREFIX = '$';

const bot = new Bot(PREFIX, ['bot-test']);