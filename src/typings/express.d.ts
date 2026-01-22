import { UserPayload } from '../modules/user/interfaces/user.interface'; // 注意路径：抽离后user.interface的路径

// 扩展Express.Request类型，全局生效
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; // 挂载用户信息到请求对象
    }
  }
}

// 必须导出空对象，确保TypeScript识别为模块
export {};
