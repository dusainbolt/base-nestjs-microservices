import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { S3Service } from '@app/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { toFile } from 'openai';
import { EnvironmentVariables } from '@app/common/interfaces/env.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(
    private readonly s3Service: S3Service,
    private configService: ConfigService<EnvironmentVariables, true>,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY') || 'sk-dummy',
    });
  }

  async transcribe(audioPath: string): Promise<{ transcript: string }> {
    try {
      this.logger.log(`Downloading audio stream from S3 for path: ${audioPath}`);
      // [1] Download audio stream từ S3
      const audioStream = await this.s3Service.getFileStream(audioPath);

      // OpenAI package requires a filename to infer content type and accept the file stream
      const filename = audioPath.split('/').pop() || 'audio.mp3';
      const file = await toFile(audioStream, filename);

      this.logger.log(`Sending audio ${filename} to OpenAI Whisper API...`);
      // [2] Gọi Whisper
      const result = await this.openai.audio.translations.create({
        model: 'whisper-1',
        file: file,
        response_format: 'text',
      });

      // When response_format is 'text', OpenAI SDK might return a string directly instead of an object.
      // Cast the result explicitly since standard types may expect an object with text property if not overridden.
      const transcript = (result as unknown as string).trim();

      // [3] Edge case: transcript rỗng
      if (!transcript) {
        throw new RpcException({
          code: 'EMPTY_TRANSCRIPT',
          message: 'Whisper returned empty transcript',
        });
      }

      this.logger.log(`Transcription completed. Transcript length: ${transcript.length}`);
      return { transcript };
    } catch (error) {
      this.logger.error(`Error during transcription: ${error.message}`, error.stack);
      throw new RpcException({
        code: 'WHISPER_ERROR',
        message: error.message || 'Error processing audio via OpenAI Whisper API',
      });
    }
  }
}
