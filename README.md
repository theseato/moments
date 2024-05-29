# 极简朋友圈

> 本项目复刻自kingwrcy大佬的[moments](https://github.com/kingwrcy/moments)

> 感谢[@jkjoy](https://github.com/jkjoy)大佬提供的Dockerfile和docker-compose.yaml

## 项目介绍

已经实现的功能:

- 支持原生全部功能
- 自动获取位置信息
- markdown支持（部分）
- 无感人机验证
- 消息推送（邮件、站内消息推送）
- 多用户
- 上传完的图片可以拖动排序
- tag/标签功能
- @/提及功能
- 查看权限功能，支持私密，或者部分用户可见

新功能预告:

[] 后台管理 ~~等之后我想写了再去写吧~~

~~[]评论按住快捷键可复制~~

## 开发进度

[https://randallanjie.notion.site/2218a0eb29f4482e92a159b3c4a3147e?v=34be316502e14e96a40b1085d4593078&pvs=4](https://randallanjie.notion.site/2218a0eb29f4482e92a159b3c4a3147e?v=34be316502e14e96a40b1085d4593078&pvs=4)

## 使用方法

详见[Wikis](https://github.com/RandallAnjie/moments/wiki/%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)

## 群晖NAS的Docker使用教程
1、先在docker文件夹里新建一个 moments文件夹（这一步就可以了，但为了后续的文件夹管理，建议再在moments文件夹里新建data文件夹）
2、使用portainer命令行进行镜像的拉取和设置，代码如下：

version: '3'
services:
  app:
    image: ranjie/rmoments:v0.4.2_with_redis  # 记得检查镜像版本
    restart: always
    ports:
      - "3000:3000" # 前面的端口号可以自行定义
    volumes:
      - /volume1/docker/moments/data:/app/data/ # 注意自己的文件夹路径


## 其他教程

详见原仓库
