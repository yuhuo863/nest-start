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
import { Exclude, Expose } from 'class-transformer';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // 排除字段，不返回给前端
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

  @Expose() // 为属性提供别名或执行函数来计算属性值, 作为实体属性字段暴露给前端
  get _someField() {
    return `${this.username}的邮箱是：${this.email}`;
  }

  // 构造函数，用于创建实例时传入部分属性
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  // 密码校验方法：调用抽离后的验证工具（供Service调用）
  async verifyPassword(plainPassword: string): Promise<boolean> {
    return verifyPassword(this.password, plainPassword);
  }
}
