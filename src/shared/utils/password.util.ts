import * as argon2 from 'argon2';

/**
 * Argon2 密码哈希配置（生产级参数，集中管理）
 * 类型约束确保配置合法，避免手写错误
 */
export const ARGON2_CONFIG: argon2.Options & { raw?: false } = {
  type: argon2.argon2id, // 推荐的混合模式，兼顾抗算力和抗内存攻击
  memoryCost: 1 << 16, // 64MB（2^16 KB）
  timeCost: 3, // 迭代次数
  parallelism: 4, // 并行度
  hashLength: 32, // 哈希长度
};

/**
 * 密码哈希工具：对明文密码进行argon2哈希
 * @param plainPassword 明文密码
 * @returns 哈希后的密码字符串
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  // 校验入参非空，避免空密码哈希
  if (!plainPassword || plainPassword.trim() === '') {
    throw new Error('明文密码不能为空');
  }
  return argon2.hash(plainPassword, ARGON2_CONFIG);
}

/**
 * 密码验证工具：校验明文密码与哈希密码是否匹配
 * @param hashPassword 已哈希的密码（数据库存储值）
 * @param plainPassword 明文密码（用户输入值）
 * @returns 匹配返回true，否则false
 */
export async function verifyPassword(
  hashPassword: string,
  plainPassword: string,
): Promise<boolean> {
  // 校验入参非空
  if (!hashPassword || !plainPassword) {
    return false;
  }
  return argon2.verify(hashPassword, plainPassword, ARGON2_CONFIG);
}
