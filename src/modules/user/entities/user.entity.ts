import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  DeleteDateColumn,
  // JoinTable,
  // ManyToMany,
  // OneToMany,
} from 'typeorm';
import {
  hashPassword,
  verifyPassword,
} from '../../../shared/utils/password.util';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
  @BeforeInsert()
  async hashPassword() {
    this.password = await hashPassword(this.password);
  }

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  avatar: string;

  @DeleteDateColumn({
    name: 'deleted_at', // 自定义数据库字段名
    type: 'datetime',
    nullable: true,
    default: null,
  })
  deleted_at: Date | null;

  // 密码校验方法：调用抽离后的验证工具（供Service调用）
  async verifyPassword(plainPassword: string): Promise<boolean> {
    return verifyPassword(this.password, plainPassword);
  }
}
