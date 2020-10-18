import { DiscordMessage, DiscordClient } from '../../discord/discord-client';
import { Odds, TriggeredEvent, ReplyWithReturn } from '../../common/decorators';
import { TriggeredEventService } from '../../common/types';
import { Injectable } from '@nestjs/common';
import { WordSmith } from '../../utilities/word-smith';

@Injectable()
export class WhatIfWeKissed implements TriggeredEventService {
    private readonly wordSmith: WordSmith;

    constructor(client: DiscordClient, wordSmith: WordSmith) {
        client.addTriggerEvent(this.response.bind(this));
        this.wordSmith = wordSmith;
    }

    @TriggeredEvent()
    @Odds(1, 50)
    @ReplyWithReturn()
    public async response(cleanContent: string, message: DiscordMessage): Promise<string> {
        const locations: string[] = await this.wordSmith.getLocations(cleanContent);
        if (locations.length === 0) return;
        const kissingLocation: string = locations[Math.floor(Math.random() * locations.length)].toLowerCase();
        const preposition = this.wordSmith.getPreposition();
        const kissingMessage: string = `😳 What if we kissed ${preposition} ${kissingLocation} 🙈`;
        return `<@${message.author.id}> ${kissingMessage}`;
    }
}
