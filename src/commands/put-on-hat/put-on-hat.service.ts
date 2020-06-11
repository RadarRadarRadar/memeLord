import { Injectable } from '@nestjs/common';
// TODO: Move import to client
import * as Discord from 'discord.js';
import * as Canvas from 'canvas';

import { DiscordClient, DiscordMessage } from 'src/discord/discord-client';
import { Command, ReplyWithReturn } from 'src/common/decorators';
import { MemeHouse } from 'src/models/meme-house.entity';
import { SortingHatUser } from 'src/models/sorting-hat-user.entity';
import { getRepository } from 'typeorm';
import { ComplexResponse } from 'src/common/types';

@Injectable()
export class PutOnHatService {
    constructor(client: DiscordClient) {
        client.addTriggerEvent(this.putOnHat);
    }
    @Command('!putOnHat')
    @ReplyWithReturn()
    public async putOnHat(message: DiscordMessage): Promise<void | string | ComplexResponse> {
        const memeHouseRepository = getRepository(MemeHouse);
        const sortingHatUserRepository = getRepository(SortingHatUser);

        const houses = await memeHouseRepository.find();

        // First lets sort our houses in ascending order based on user count
        const sortedHouses = houses.sort((a, b) => {
            return a.sortingHatUsers.length < b.sortingHatUsers.length ? -1 : 1;
        });

        // First let's find our smallest houses
        const smallestHouseIds: number[] = [];
        const lowestCount: number = sortedHouses[0].sortingHatUsers.length;

        for (const house of houses) {
            const houseSize = house.sortingHatUsers.length;
            if (houseSize === lowestCount) {
                smallestHouseIds.push(house.id);
            }
        }

        // Select a random house from the list of smallest houses
        const chosenHouse: number = smallestHouseIds[Math.floor(Math.random() * smallestHouseIds.length)];

        // Because wonder should exist in this world lets also have the opportunity to land in ANY house
        const luckyHouse: number = sortedHouses[Math.floor(Math.random() * houses.length)].id;

        const user = await sortingHatUserRepository.findOne({
            where: {
                authorId: message.author.id
            }
        });

        const newHouse = await memeHouseRepository.findOne({
            where: {
                id: Math.floor(Math.random() * 10) === 0 ? luckyHouse : chosenHouse
            }
        });

        if (user == null) {
            // If the user didn't already exist - create them
            await sortingHatUserRepository.insert({
                authorId: message.author.id,
                memeHouseId: newHouse.id
            });
        } else {
            // If the user does exist - lets make sure that they're waited 1 day before asking
            const DAY_IN_MILLISECONDS = 86400000;
            const now = Date.now();
            const lastUpdate = user.lastSortTime;

            if (now - lastUpdate < DAY_IN_MILLISECONDS) {
                // Chide them if need be!
                return `Too soon, <@${message.author.id}>! Try again tomorrow!`;
            } else {
                await sortingHatUserRepository.update(
                    {
                        authorId: user.authorId
                    },
                    {
                        memeHouseId: newHouse.id
                    }
                );
            }
        }

        const attachment = await this.createHouseImage(newHouse);

        return {
            reply: `Congrats, <@${message.author.id}>! You're now a member of ${newHouse.name}`,
            attachment: attachment
        };
    }

    private async createHouseImage(house: MemeHouse): Promise<Buffer> {
        const canvas = Canvas.createCanvas(480, 480);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage(`images/${house.houseImage}`);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.font = '48px impact';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';

        // Actually fill the text with a solid color
        const x = 240;
        const y = 410;
        const maxWidth = 400;
        ctx.textAlign = 'center';

        ctx.fillText(house.name, x, y, maxWidth);
        ctx.strokeText(house.name, x, y, maxWidth);

        return canvas.toBuffer();
    }
}