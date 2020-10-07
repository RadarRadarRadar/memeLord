import * as fs from 'fs';
import { DiscordClient, DiscordMessage } from '../../discord/discord-client';
import { TriggeredEvent, ReplyWithReturn } from '../../common/decorators';
import { TriggeredEventService, ComplexResponse } from '../../common/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CoolAbedService implements TriggeredEventService {
    constructor(client: DiscordClient) {
        client.addTriggerEvent(this.response);
    }

    @TriggeredEvent(msg => {
        const coolCount = msg
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.includes('cool') || word.includes('🆒'));

        return coolCount.length > 2;
    })
    @ReplyWithReturn()
    public response(cleanContent: string, message: DiscordMessage): ComplexResponse {
        const coolAbedGif = fs.readFileSync('images/coolAbed.gif');
        return {
            reply: `<@${message.author.id}>`,
            attachment: coolAbedGif,
            fileType: 'gif'
        };
    }
}
