/**
 * A module to use 2captcha to solve captchas
 * @module 2captcha
 */

/*
=======================================================
                Module dependencies
=======================================================
*/
const request = require('request').defaults({
    jar: true // enable cookie support, default is false
});


/*
=======================================================
                Module constants
=======================================================
*/

/**
 * Url to send captchas to 2captcha
 */
const SEND_CAPTCH_URL = "http://2captcha.com/in.php";

/**
 * Url for get captchas from 2captcha
 */
const GET_CAPTCHA_URL = "http://2captcha.com/res.php?id={ID}&key={API_KEY}&action=get&json=1";

/**
 * The ApiKey provided by 2captcha
 */
let apiKey = '';

let pollingId;

let captchas = [];

function handler() {
    setInterval(() => {
        for (let captcha of captchas) {
            let url = GET_CAPTCHA_URL.replace('{ID}', captcha.requestId).replace('{API_KEY}', apiKey);
            get(url).then((response) => {
                let serverResponse = JSON.parse(response);
                if (serverResponse.status == 1) {
                    console.log(`Captcha resolvido: ${serverResponse.request}`);
                    captcha.callback(serverResponse.request);
                    captchas.splice(captchas.indexOf(captcha), 1);
                }
            }).catch(error => {
                console.log(error);
            });
        }
    }, pollingInterval)
}


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
 * Sets the api key
 * 
 * For further information about how to generate your api key check the 
 * {@link https://2captcha.com/2captcha-api#solving_captchas | 2captcha } documentation
 * @param {String} apiKey  The api key provided by 2captcha.
 */
let useKey = (key) => {
    apiKey = key;
    handler();
}

/**
 * Solves a Google Recaptcha V2 chalange
 * @param {String} googlekey the google key used by the page
 * @param {String} pageurl the page url that displays the Recaptcha 
 * @throws {MissingApiKey} 
 * @return {Promise<boolean>} 
 */
let solveGoogleRecaptchaV2 = (googlekey, pageurl) => {
    checkForApiKey();
    return new Promise((resolve, reject) => {
        request.post(SEND_CAPTCH_URL, {
            formData: {
                key: apiKey,
                googlekey: googlekey,
                method: 'userrecaptcha',
                pageurl: pageurl,
                json: '1'
            }
        }, (error, response, body) => {
            if (error) {
                reject(error);
            }
            let serverResponse = JSON.parse(body);
            if (serverResponse.status === 1) {
                console.log('New Captcha to solve with id: ' + serverResponse.request);
                captchas.push(new Captcha(serverResponse.request, (token) => {
                    resolve(token);
                }));
            }
        });
    });
}

/**
 * @class 
 */
class MissingApiKey extends Error {
    constructor() {
        super('You must call useKey before invoke any method of this module.');
    }
}

class Captcha {
    constructor(requestId, callback) {
        this.requestId = requestId;
        this.lastAttempt = new Date();
        this.status = 0;
        this.callback = callback;
    }
}

/**
 * Checks if 
 * @throws {MissingApiKey} an error if the useKey was not invoked before.
 */
let checkForApiKey = () => {
    if (!apiKey) {
        throw new MissingApiKey();
    }
}


module.exports.useKey = useKey;
module.exports.solveGoogleRecaptchaV2 = solveGoogleRecaptchaV2;