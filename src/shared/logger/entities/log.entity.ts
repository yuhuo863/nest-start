import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('sys_logs')
export class LogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  level: string; // error, info, warn 等

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  meta: string | null;

  @CreateDateColumn({
    type: 'datetime', // 自动 CURRENT_TIMESTAMP
    comment: '日志创建时间',
  })
  timestamp: Date; // TypeORM 自动管理
}
