# Packtpub Notifier

A bot to notify about the daily free ebooks from packtpub. 

----------

## Requirements
* [node.js](https://nodejs.org), version 8.1.3+ (only tested on v8.1.3)

## How to install
```bash
git clone https://github.com/maikemota/packtpubbot.git
```
----------

## Configuration

The bot uses a json configuration file to get the bot token and receivers' Ids.
Rename the config.template.json file where you cloned the repository and sets the requested data. Example of config.json:

```json
{
  "botToken": "{YourTelegramBotToken}",
  "receiversIds": ["{receiverId1}, {receiverId2}, {receiverId3}"]
}
```

### botToken

Token of the Telegram's bot, maybe you need to talk with the [BotFather](https://telegram.me/BotFather) 

----------

### receiversIds

An array of receivers id, this could be a individual chat id or a group chat id.

----------


## How to use

After set up your config.json, you start the bot with following statements:
```bash
npm install # only on first run
npm start
```
## Cron job
Find the absolute location of npm and copy it:
```bash
which node
```
Open cron job table with:
```bash
crontab -e
```
Add following statements for every day cron job at 9 am:
```bash
0 9 * * * <PATH_TO_NODE>/node <PATH_TO_REPO>/index.js >> /var/log/packtpub.log 2>&1
```

----------

## Don't want to host and run by yourself? 

 [Join us](https://t.me/joinchat/Db5Zqwsjm3WixWcPzWLzOg) and get notified about the book of the day!


# That's all folks ;)