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
    let ebookData = processBody(body);
    console.log("Book of the Day: " + ebookData.name);
    inform(config.receiverId, ebookData.name, ebookData.cover).then(() => {
        console.log(`----- End requesting book name from packtpub (${new Date().toLocaleString()}) -----`);
        process.exit(0);
    });
});

/**
 * Wraps the request from node in a promise
 * @param {String} targetUrl the target Url
 */
async function get(targetUrl) {
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
 * Process the body of the page
 * @param {String} body the body to be processed
 * @returns {BookData} An object containing the ebook data.
 */
function processBody(body) {
    let $ = cheerio.load(body);
    let bookName = $('.dotd-title').find('h2').text().trim();
    let bookCover = $('.bookimage')[0].attribs.src;
    if (bookCover.startsWith('//')) {
        bookCover = `https:${bookCover}`;
    }
    return {
        'name': bookName,
        'cover': bookCover
    }
}

/**
 * Notify the receiver about the book of the day
 * @param {String} chatId The id of the chat with the user/group.
 * @param {String} bookName The name of the book.
 * @param {String} bookCover The link to the book cover.
 */
async function inform(chatId, bookName, bookCover) {
    await bot.sendChatAction(chatId, 'typing');
    await bot.sendMessage(chatId, `Sr, the book of the day: <strong>${bookName}</strong>`, { "parse_mode": "html" });
    await bot.sendChatAction(chatId, 'upload_photo');
    let encodedUrl = encodeURI(bookCover);
    await bot.sendPhoto(chatId, `${encodedUrl}`, { "caption": bookName });
    await bot.sendChatAction(chatId, 'typing');
    await bot.sendMessage(chatId, `<a href='${packtpubFreeLearningUrl}'>Claim it at packetpub!</a>`, { "parse_mode": "html" });
}