# 极简朋友圈

> 本项目复刻自kingwrcy大佬的[moments](https://github.com/kingwrcy/moments)

## 项目介绍

已经实现的功能:

- 支持原生全部功能
- 自动获取位置信息
- markdown支持
- 验证码支持
- 消息推送（邮件）
- 多用户

新功能预告:

[ ] 后台管理

[ ] 评论按住快捷键可复制


## 源码编译启动

首先设置环境变量:

```
# 设置 sqlite 数据库位置
export DATABASE_URL="file:/root/moments/data/db.sqlite" 
# 设置本地上传的文件目录
export UPLOAD_DIR="/root/moments/data/upload"
```
> 或者写进环境变量中

执行命令

```
# 安装依赖
npm install
# 脚本迁移
npx prisma migrate dev
# 执行构建
npm run build
# 预览
npm run preview
```

## 其他教程

详见原仓库