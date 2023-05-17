const fs = require('fs')
const ran = require('randomstring')
const {
    MessageEmbed
} = require('discord.js');

function log(path, string) {
    fs.appendFileSync("logs/" + path, string, function (err) {
        if (err) throw (err);
    })
}

function redeemKey(key, message) {
    var data = fs.readFileSync('keys/keys.json');
    var keyList = JSON.parse(data);
    if (keyList[key]) {
        let days = keyList[key] / 86400;
        let accDays = keyList[key];
        delete keyList[key]
        fs.writeFile('keys/keys.json', JSON.stringify(keyList), err => {
            if (err) throw err;
            console.log("The key '" + key + "' was redeemed with " + days + " day(s) access.");
            log("redemptions.log", "\nThe key '" + key + "' was redeemed with " + days + " day(s) access by <@" + message.author.id + " or " + message.author.tag)
        });
        var newD = fs.readFileSync("keys/redeemedKeys.json");
        var list = JSON.parse(newD)
        let inp = message.author.id
        if (list[inp] >= (Math.floor(Date.now() / 1000))) {
            list[inp] += accDays;
            fs.writeFile('keys/redeemedKeys.json', JSON.stringify(list), err => {
                if (err) throw err;
            });
            return [true, days]
        } else {
            let newArr = [true, days]
            list[inp] = (Math.floor(Date.now() / 1000)) + accDays;
            message.guild.channels.create(message.author.id, {
                type: "GUILD_TEXT",
                parent: "964182141716029540",
                lockPermissions: true
            }).then(async channel => {
                await message.member.roles.add("964183940007100527")
                await channel.permissionOverwrites.create(message.author, {
                    SEND_MESSAGES: true,
                    VIEW_CHANNEL: true,
                    READ_MESSAGE_HISTORY: true
                })
                await channel.send(`<@${message.author.id}>`)
                const toRep = await new MessageEmbed()
                    .setColor('#77ff90')
                    .setTitle("All Commands")
                    .addField("Public", "`.redeem {key}`")
                    .addField("Access", "`.call`\n`.bomb {email}`\n`.checkTime`")
                    .addField("Admins", "`.createKey {days}`")
                await channel.send({
                    embeds: [toRep]
                })
                await fs.writeFile('keys/redeemedKeys.json', JSON.stringify(list), err => {
                    if (err) throw err;
                });
            })
            return [true, days]
        }
    } else {
        return [false, null]
    }
}

function createKey(days) {
    if (Number.isInteger(days)) {
        if (days => 1) {
            var data = fs.readFileSync('keys/keys.json');
            const epochTime = (days * 86400);
            const key = "key-" + ran.generate({
                length: 4,
                capitalization: 'lowercase'
            }) + "-" + ran.generate({
                length: 4,
                capitalization: 'lowercase'
            });
            var keyList = JSON.parse(data);
            keyList[key] = epochTime;
            fs.writeFile('keys/keys.json', JSON.stringify(keyList), err => {
                if (err) throw err;
                console.log("New key entry '" + key + "' was created with " + days + " day(s) access.");
            });
            return key;
        } else {
            console.log(days + " amount of days isn't valid!")
            return days + " amount of days isn't valid!";
        }
    } else {
        console.log("The input '" + days + "' is either a decimal or string!")
        return "The input '" + days + "' is either a decimal or string!";
    }
}

module.exports = {
    redeemKey,
    createKey
}