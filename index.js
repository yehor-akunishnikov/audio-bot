const Discord = require('discord.js');
const bot = new Discord.Client();
const settings = require('./settings.json');
const mp3d = require('mp3-duration');
const Downloader = require('downloader.js');
const folder = new Downloader('dist');
const MediaSplit = require('media-split');

bot.login(settings.token);

const playList = [];
let dispatcher = null;
let isPlaying = false;
let currentTimer = null;
let timerMessage = null;

const checkChannel = (name) => {
    const { whitelist } = settings;
    return whitelist.indexOf(name) > -1;
};

const getData = (text) => {
    const [command, ...params] = text.split(' ');
    return { command, params }
};

const playAudio = async (chan, name, textChan) => {
    const url = 'dist/' + name;
    const duration = await getDuration(url);

    chan.join().then(connection => {
        const start = () => {
            const stream = connection.play(playList[0].url, {volume: 0.5});
            dispatcher = stream;
            isPlaying = true;

            stream.on('finish', () => {
                clearInterval(currentTimer);
                isPlaying = false;
                playList.shift();
                if(playList.length) {
                    start();
                }
            });
        };

        connection.on('disconnect', () => {
            clearInterval(currentTimer);
            isPlaying = false;
            playList.shift();
        });

        if(isPlaying) {
            showMessage(textChan, `В очереди: ${name}. Продолжительность: ${duration}`);
            playList.push({url, name});
        }else {
            showMessage(textChan, `Играет: ${name}. 00:00:00 / ${duration}`);
            playList.push({url, name});
            start();
        }
    }).catch(err => console.log(err));
};

const pauseAudio = () => {
    if(dispatcher) {
        dispatcher.pause();
        clearInterval(currentTimer);
    }
};

const resumeAudio = () => {
    if(dispatcher) {
        dispatcher.resume();
        startTimer(timerMessage);
    }
};

const showHelp = (chan) => {
    chan.send('play name; pause; resume; clear; controls; down name link; skip, cut partname');
};

const clear = (chan) => {
    if(!isPlaying) {
        chan.bulkDelete(100);
    }
};

const showControls = (message) => {
    const listenEmoji = (eventName, action) => {
        bot.on(eventName, (reaction, user) => {
            if(!user.bot && reaction.message === message) {
                const emoji = reaction['_emoji'].name;
                if(emoji === '⏯️') {
                    action();
                }
            }
        });
    };

    message.react('⏯️');
    if(dispatcher) {
        listenEmoji('messageReactionAdd', pauseAudio);
        listenEmoji('messageReactionRemove', resumeAudio);
    }
};

const downloadFile = async (chan, downloadLink, textChan, fileName) => {
    showMessage(textChan, 'Пошла загрузка...');

    await folder.download({
        downloadLink,
        fileName
    }).catch(console.error);

    playAudio(chan, fileName, textChan);
};

const getDuration = async (url) => {
    const duration = await mp3d(url, function (err, duration) {
        if (err) return console.log(err.message);
        return duration;
    });
    const [ hour, min, sec ] = formatTime(duration);

    return hour + ':' + min + ':' + sec;
};

const splitTime = (duration) => {
    const hour = Math.floor(duration / 60 / 60);
    const min = Math.floor(duration / 60) - (hour * 60);
    const sec = Math.floor(duration % 60);

    return [hour, min, sec];
}

const formatTime = (duration) => {
    const timeArr = splitTime(duration);

    for(let i = 0; i < timeArr.length; i++) {
        if((timeArr[i] + '').length < 2) {
            timeArr[i] = '0' + timeArr[i];
        }
    }

    return timeArr;
};

const showMessage = (chan, message) => {
    chan.send(message);
}

const skip = (chan, voiceChan) => {
    if(playList.length > 1) {
        dispatcher.end();
        clearInterval(currentTimer);
        playList.shift();
        playAudio(voiceChan, playList[0].name, chan);
    }
};

const cutFile = (name) => {
    const url = playList[0].url;
    const duration = getCurrentDuration();
    const split = new MediaSplit({ input: url, output: 'dist', sections: [`[${duration}] ${name}`] });
    console.log('Обрезается...');
    split.parse().then(([name]) => {
        console.log(name);
    });
};

const getCurrentDuration = () => {
    return formatTime(dispatcher.streamTime / 1000).join(':');
};

const editMessage = (message, newText) => {
    message.edit(newText);
};

const refreshTimerMessage = () => {
    const splited = timerMessage.content.split(' ');
    splited[2] = getCurrentDuration();
    editMessage(timerMessage, splited.join(' '));
};

const startTimer = (message) => {
    timerMessage = message;

    currentTimer = setInterval(() => {
        refreshTimerMessage();
    }, 5000);
};

bot.on('message', (message) => {
    const { channel:chan, content, member:{ voice:{ channel:voiceChan } } } = message;
    const { name } = chan;
    const isWhitelist = checkChannel(name);

    if(isWhitelist) {
        const { command, params } = getData(content);
        if(message.author.id === '845123286216081429' && content.indexOf('00:00:00 / ') > -1) {
            startTimer(message);
        }

        switch(command) {
            case '$play':
                playAudio(voiceChan, params[0], chan);
            break;
            case '$pause':
                pauseAudio();
            break;
            case '$resume':
                resumeAudio();
            break;
            case '$help':
                showHelp(chan);
            break;
            case '$clear':
                clear(chan);
            break;
            case '$controls':
                showControls(message);
            break;
            case '$down':
                downloadFile(voiceChan, params[1], chan, params[0] + '.mp3');
            break;
            case '$skip':
                skip(chan, voiceChan);
            break;
            case '$cut':
                cutFile(params[0]);
            break;
            default:
            break;
        }
    }
});