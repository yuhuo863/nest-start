import TransportStream, { TransportStreamOptions } from 'winston-transport';
import { Repository } from 'typeorm';
import { LogEntity } from '../../shared/logger/entities/log.entity';

export class DatabaseTransport extends TransportStream {
  constructor(
    private logRepository: Repository<LogEntity>,
    opts: TransportStreamOptions = {}, // ← 支持传入选项（如 level）
  ) {
    super({
      // 级别顺序（从低到高）：debug < info < warn < error
      level: 'debug', // 默认级别
      ...opts,
    });
  }

  async log(info: any, next: () => void) {
    try {
      const { level, message, context, stack, ...meta } = info;

      const fullMeta = {
        context,
        stack,
        ...meta,
      };

      const logEntity = this.logRepository.create({
        level: level as string,
        message: message?.toString() || '',
        meta:
          Object.keys(fullMeta).length > 0 ? JSON.stringify(fullMeta) : null,
      });

      await this.logRepository.save(logEntity);
      next();
    } catch (error) {
      console.error('Failed to save log to database:', error);
      next();
    }
  }
}
