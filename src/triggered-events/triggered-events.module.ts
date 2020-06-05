import { Module } from '@nestjs/common';
import { GundamLikeService } from './gundam-like/gundam-like.service';
import { DiscordModule } from 'src/discord/discord.module';
import { ButtBotService } from './butt-bot/butt-bot.service';
import { CoolAbedService } from './cool-abed/cool-abed.service';
import { DontAtMeService } from './dont-at-me/dont-at-me.service';
import { EdfService } from './edf/edf.service';
import { MrTrumpService } from './mr-trump/mr-trump.service';
import { NoUService } from './no-u/no-u.service';
import { PeteRatService } from './pete-rat/pete-rat.service';
import { SmolDogService } from './smol-dog/smol-dog.service';
import { WarrenSnakeService } from './warren-snake/warren-snake.service';
import { WontDoService } from './wont-do/wont-do.service';
import { SpongebobService } from './spongebob/spongebob.service';
import { StudyBladeService } from './study-blade/study-blade.service';
import { UtilitiesModule } from 'src/utilities/utilities.module';

@Module({
    providers: [GundamLikeService, ButtBotService, CoolAbedService, DontAtMeService, EdfService, MrTrumpService, NoUService, PeteRatService, SmolDogService, WarrenSnakeService, WontDoService, SpongebobService, StudyBladeService],
    imports: [DiscordModule, UtilitiesModule],
})
export class TriggeredEventsModule {}
