import * as fs from 'fs';
import * as Discord from 'discord.js';

import { Command } from './interfaces';
import { ShitPosts } from './models/shitPosts'
import { sequelize } from './lib/db'
import { hashAttachment } from './lib/hashAttatchment';
import { Sequelize, Op } from 'sequelize';

// Create an instance of a Discord client
const client = new Discord.Client();
const commands = new Discord.Collection<string, Command>();

const commandFiles: string[] = fs.readdirSync('src/commands/').filter((file => file.endsWith('.ts')))

for (const file of commandFiles){
  const commandFile: Command = require(`./commands/${file}`)
  commands.set(commandFile.name, commandFile)
}

client.on('ready', async () => {
  await sequelize.sync();
  console.log('I am ready!');
});

// N.B.
// Events handlers are run in the order you add them, FYI, so order here is important!!!!

// Save shit posts here
client.on('message', async (message: Discord.Message) => {
  if(isMemeLord(message)) return;
  for (const [name, attachment] of message.attachments){
    const imageHash = await hashAttachment(attachment.attachment)
    await ShitPosts.create({user: message.author.id, messageContent: message.content, imageHash })
  }
});

// Find MEME CRIMES here
client.on('message', async (message: Discord.Message) => {
  if(isMemeLord(message)) return;
  const hashMap = {};
  for (const [name, attachment] of message.attachments){
    hashMap[(await hashAttachment(attachment.attachment))] = attachment.attachment
  }

  const memeCrime = await ShitPosts.findOne({
    where: {
      imageHash: {
        [Op.in]: Object.keys(hashMap)
      }
    }
  })

  if(!memeCrime) return;

  const embed = new Discord.MessageEmbed()
    .setColor('#ff001e')
    .setTitle('A MEME CRIME HAS BEEN COMITTED')
    .setAuthor('MEME POLICE')
    .setDescription(`<@${message.author.id}> HAS COMMITTED A GRAVE SIN`)
    .addField('THE AGGRIVED PARTY',`<@${memeCrime.get('user')}>`,true)
    .setImage(hashMap[memeCrime.get('imageHash')])

  message.channel.send(embed);
});

// Command handler
client.on('message', async (message: Discord.Message) => {
  if(isMemeLord(message)) return;
  for(const command of commands.values()){
    if((await command.trigger(message, { client }))){
      console.log(`acting on command '${command.name}' for message \`${message.content}\``)
      await command.execute(message, { client })
    }
  }
});

client.login(process.env.CLIENT_TOKEN);

function isMemeLord(message: Discord.Message): boolean {
  return client.users.cache.get(message.author.id)?.username === 'MemeLord';
}