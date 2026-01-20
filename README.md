1. 数据库（Schema）：必须手动创建（或通过初始化脚本自动化），TypeORM 不自动创建；

2. 表结构：开发环境开启 synchronize: true，TypeORM 自动创建 / 更新表；生产环境关闭该配置，用迁移脚本管理；

**核心建议**：
- 开发环境：手动创建数据库，依赖 synchronize 快速同步表结构；
- 生产环境：手动创建数据库，通过 typeorm migration:generate/run 管理表结构，绝对禁用 synchronize。