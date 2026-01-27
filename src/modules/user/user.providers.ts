import { DATA_SOURCE, USER_REPOSITORY } from '../../config/constants';
import { DataSource } from 'typeorm';
import { UserEntity } from './entities/user.entity';

export const userProviders = [
  {
    /**
     * 把 NestJS 的 IOC 容器（依赖注入容器）想象成一家高级餐厅
     * 这里的 provide 值就是菜名
     * 这里的 useFactory 函数是大厨的烹饪步骤
     * 这里的 Inject 值是大厨做菜需要的原材料/工具/食材
     * 上面的 Service (AuthService) 是吃菜的顾客。
     * 流程:
     * 1. 定义菜单 (Module Provider)： 你在 Module 里写下这段代码，等于告诉餐厅经理（NestJS）：
     * “如果有顾客想要点 USER_REPOSITORY (菜名)，请让大厨按照 useFactory (烹饪步骤) 现做一份。
     * 但是，做这道菜之前，请先把 DATA_SOURCE (原材料) 递给大厨。”
     * 2. 顾客点单 (Service Constructor)： 在 UserService 中，你写了 @Inject(USER_REPOSITORY)，这等于顾客坐下说：
     * “我需要 USER_REPOSITORY 这道菜，麻烦厨师长给我做一份。”
     * 3. 上菜 (Dependency Injection)：
     * - NestJS 看到需求，发现这是一个工厂模式。
     * - 它先去仓库找到 DATA_SOURCE（数据库连接）。
     * - 把它传给 useFactory 函数。
     * - 函数运行：dataSource.getRepository(UserEntity)。
     * - 函数返回了一个 Repository 对象（做好那道菜）。
     * - NestJS 把这盘“红烧肉”递给 UserService。
     * 最终结果：顾客(你的 Service)拿到的不是“烹饪步骤”，而是做好的菜（Repository 实例），顾客可以直接吃（操作数据库）。
     */
    // 1. 令牌 (Token)：
    // 这是你们约定的暗号。你在 Service 里 @Inject 谁，这里就写谁。
    // 通常是一个字符串常量 (如 'USER_REPOSITORY')。
    provide: USER_REPOSITORY,
    // 2. 工厂函数 (Factory Function)：
    // 这就是实际干活的逻辑。
    // 注意它的参数 (dataSource)，这个参数是从下面 inject 数组里来的。
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserEntity),
    // 3. 依赖注入 (Inject Dependencies)：
    // 告诉 NestJS："运行上面那个工厂函数之前，请先帮我找到 DATA_SOURCE 实例，并作为参数传进去"。
    // 顺序必须和 useFactory 的参数顺序一一对应。
    inject: [DATA_SOURCE],
  },
];
