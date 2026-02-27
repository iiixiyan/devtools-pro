# DevTools Pro - 部署指南

## 🚀 快速开始

### 前提条件

- Node.js 18+ 和 npm
- PostgreSQL 14+
- Redis 6+
- OpenAI API Key

### 1. 克隆仓库

```bash
git clone https://github.com/iiixiyan/devtools-pro.git
cd devtools-pro
```

### 2. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 3. 配置环境变量

```bash
# 后端
cd backend
cp .env.example .env

# 编辑 .env 文件，填入你的配置
nano .env
```

**.env 配置示例：**
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devtools_pro
DB_USER=postgres
DB_PASSWORD=your-password
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-your-openai-api-key
JWT_SECRET=your-secret-key-change-in-production
APP_URL=http://localhost:3000
API_URL=http://localhost:3001
```

### 4. 初始化数据库

```bash
# 使用 PostgreSQL
psql -U postgres -f backend/init-db.sql
```

### 5. 启动服务

```bash
# 启动后端
cd backend
npm run dev

# 在新终端启动前端
cd frontend
npm run dev
```

### 6. 访问应用

打开浏览器访问：http://localhost:3000

**默认登录账号：**
- Email: demo@devtoolspro.com
- Password: password123

---

## 📦 生产部署

### 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 环境变量配置

```env
PORT=3001
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_NAME=devtools_pro
DB_USER=postgres
DB_PASSWORD=your-strong-password
REDIS_URL=redis://redis:6379
OPENAI_API_KEY=your-production-api-key
JWT_SECRET=your-production-secret-key
APP_URL=https://your-domain.com
API_URL=https://api.your-domain.com
```

---

## 🔧 API 端点

### 代码生成
- POST `/api/v1/code/generate` - 生成代码
- POST `/api/v1/code/optimize` - 优化代码
- POST `/api/v1/code/explain` - 解释代码
- POST `/api/v1/code/detect-bugs` - 检测bug

### 订阅管理
- GET `/api/v1/subscriptions/plans` - 获取定价方案
- POST `/api/v1/subscriptions/register` - 注册
- POST `/api/v1/subscriptions/login` - 登录
- GET `/api/v1/subscriptions/profile` - 获取用户信息
- POST `/api/v1/subscriptions/upgrade` - 升级计划

### 健康检查
- GET `/api/v1/health` - 健康检查

---

## 📊 数据库架构

### Users 表
- `id` - UUID, 主键
- `email` - 邮箱（唯一）
- `password` - 密码（加密）
- `name` - 用户名
- `plan` - 订阅计划（free/pro/enterprise）
- `usage_count` - 每日使用次数
- `last_reset_date` - 上次重置日期
- `created_at` - 创建时间

### Usage Logs 表
- `id` - UUID, 主键
- `user_id` - 用户ID
- `action` - 操作类型
- `details` - 详细信息
- `created_at` - 创建时间

---

## 💡 成功指标

### 第1年目标（10万收入）
- Q1: 项目搭建完成
- Q2: MVP发布，获得100个用户
- Q3: 产品优化，月收入5,000元
- Q4: 商业化落地，月收入10,000元

### 第2年目标（40万收入）
- Q1-Q2: 规模化，月收入20,000-30,000元
- Q3-Q4: 产品化，月收入40,000-60,000元

---

## 📞 支持

如有问题，请提交 Issue：https://github.com/iiixiyan/devtools-pro/issues
