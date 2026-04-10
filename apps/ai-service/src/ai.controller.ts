import { AI_COMMANDS, RmqInterceptor } from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { AiService } from './ai.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @MessagePattern({ cmd: AI_COMMANDS.TRANSCRIBE_AUDIO })
  async transcribeAudio(@Payload() payload: { audioPath: string }) {
    return this.aiService.transcribe(payload.audioPath);
  }

  // Tầng 2 AI Scoring -> Using EventPattern to run completely asynchronously in the background.
  @EventPattern(AI_COMMANDS.SCORE_PACK_ATTEMPT)
  async handleScorePackAttempt(@Payload() payload: any) {
    // Later implement actual scoring logic using openai completions.
    // return this.aiService.scorePackAttempt(payload);
    console.log('Received ScorePackAttempt', payload);
  }
}
