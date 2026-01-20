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
import { IsEmail } from 'class-validator';
import * as argon2 from 'argon2';

// 自定义 argon2 哈希配置（生产级参数，可根据服务器性能微调）
const ARGON2_OPTIONS: argon2.Options & { raw?: false } = {
  type: argon2.argon2id, // 推荐的混合模式，兼顾抗算力和抗内存攻击
  memoryCost: 1 << 16, // 内存成本：64MB（2^16 KB），默认是2^15（32MB）
  timeCost: 3, // 迭代次数：3，默认是3，可根据性能调整
  parallelism: 4, // 并行度：4，默认是1，利用多核提升破解难度
  hashLength: 32, // 哈希长度：32字节
};

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  password: string;
  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password, ARGON2_OPTIONS);
  }

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  avatar: string;

  @DeleteDateColumn({
    name: 'deleted_at', // 自定义数据库字段名（可选）
    type: 'datetime',
    nullable: true,
    default: null,
  })
  deleted_at: Date | null;

  // 密码校验方法（供Service调用）
  async verifyPassword(plainPassword: string): Promise<boolean> {
    return argon2.verify(this.password, plainPassword, ARGON2_OPTIONS);
  }
}
