import TransportStream from 'winston-transport';
import { Repository } from 'typeorm';
import { LogEntity } from '../shared/logger/log.entity';

export class DatabaseTransport extends TransportStream {
  constructor(private logRepository: Repository<LogEntity>) {
    super({
      level: 'debug', // 默认级别，可以根据需要调整
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
