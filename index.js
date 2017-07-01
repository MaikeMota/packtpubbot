const config = require('./config.json');
const request = require('request').defaults({
    jar: true // enable cookie support, default is false
});
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(config.botToken);
const packtpubFreeLearningUrl = 'https://www.packtpub.com/packt/offers/free-learning';

console.log(`----- Start requesting book name from packtpub (${new Date().toLocaleString()}) -----`);

get(packtpubFreeLearningUrl).then((body) => {
    var $ = cheerio.load(body);
    let bookName = $('.dotd-title').find('h2').text().trim();
    let bookCover = $('.bookimage')[0].attribs.src;
    console.log("Book of the Day: " + bookName);
    inform(config.receiverId, bookName, bookCover);
    console.log(`----- End requesting book name from packtpub (${new Date().toLocaleString()}) -----`);
}).catch(error => {
    console.error('Error while requesting book name.');
    console.error(error);
});


/**
 * Wraps the request from node in a promise
 * @param {String} targetUrl the target Url
 */
function get(targetUrl) {
    return new Promise((resolve, reject) => {
        request(targetUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

/**
 * Notify the receiver about the book of the day
 * 
 * @param {String} chatId The id of the chat with the user/group.
 * @param {String} bookName The name of the book.
 * @param {String} bookCover The link to the book cover.
 */
async function inform(chatId, bookName, bookCover) {
    await bot.sendChatAction(chatId, 'typing');
    await bot.sendMessage(chatId, `Sr, the book of the day: <strong>${bookName}</strong>`, { "parse_mode": "html" });
    await bot.sendChatAction(chatId, 'upload_photo');
    await bot.sendPhoto(chatId, `${bookCover}`);
    await bot.sendChatAction(chatId, 'typing');
    await bot.sendPhoto(chatId, `<a href='${packtpubFreeLearningUrl}'></a>`, { "parse_mode": "html" });
}