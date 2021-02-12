import { Logger } from './logger';

export interface FessoniaConfig {
  ffmpeg_bin: string;
  ffprobe_bin: string;
  debug: boolean;
  log_warnings: boolean;
  logger: Logger;
}
