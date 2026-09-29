# CMTI 竞赛人格探索

包含 24 题七点量表、最后方向微调题、六维结果、参考赛事匹配、竞赛问答、人格图鉴和管理员后台的中文网页原型。

## 本地运行

需要 Node.js 20 或更新版本。在项目目录执行：

```powershell
Copy-Item .env.example .env
```

编辑 `.env`，至少设置唯一的管理员密码。要连接 Coze，再填写新的 `COZE_API_TOKEN`。然后启动：

```powershell
node server.mjs
```

访问 `http://127.0.0.1:4174`；管理员后台在 `/admin`。若 4174 端口已被占用，在 `.env` 中把 `PORT` 改成其他空闲端口并重新启动。

## 部署到 Render

仓库包含 `render.yaml`，可通过 Render Blueprint 部署：

1. 将最新代码推送到 GitHub。
2. 在 Render Dashboard 选择 **New +** → **Blueprint**。
3. 连接 GitHub 仓库 `Fiona-0yx/CMTI`，Render 会自动读取 `render.yaml`。
4. 在环境变量页面填写 `COZE_API_TOKEN`、`COZE_BOT_ID` 和 `CMTI_ADMIN_PASSWORD`；不要填写或上传本地 `.env`。
5. 创建服务并等待部署完成。Render 提供的 `https://...onrender.com` 地址就是公网网页，管理员后台地址为该网址加 `/admin`。

Render 会自动提供 `PORT`，无需手动设置。当前学生结果保存在实例内的 `data/results.json`；无持久磁盘的实例在重启或重新部署后可能丢失记录，正式使用前应改用数据库或配置持久磁盘。

学生提交的记录写入 `data/results.json`。文件含有姓名和专业等个人信息，不应公开或提交到代码仓库。

## Coze 接入

服务端会在启动时读取项目根目录的 `.env`。配置项：

```text
COZE_API_TOKEN=你的新 PAT
COZE_BOT_ID=7688608892233777215
COZE_API_BASE=https://api.coze.cn
```

网页调用本项目代理，不会接触 PAT：

```http
POST /api/chat
Content-Type: application/json
```

请求字段：`message`（必填）、`conversationId`（续聊时传回上次返回值）、`userId`，以及可选的 `profile` 兴趣摘要。示例：

```json
{
  "message": "结合我的兴趣，适合从哪项竞赛开始？",
  "userId": "cmti-student-01",
  "profile": {
    "major": "软件工程",
    "share": { "A": 30, "E": 25, "I": 15, "S": 10, "H": 8, "M": 12 },
    "primary": "A",
    "second": "E"
  }
}
```

成功时返回 `mode: "coze"`、`reply` 和 `conversationId`。未配置凭据或 Coze 不可用时，接口返回本地演示模式；`GET /api/health` 的 `aiConfigured` 可用于检查服务端是否读到了配置。更换 `.env` 后必须重启服务。

你先前粘贴在对话里的 PAT 已暴露，请先在 Coze 撤销它并新建一个，再只填进本地 `.env`。不要把密钥填入网页代码、截图或前端请求。

## 权重与结果

24 道七点题按 `(答案 - 1) / 6` 标准化，每维取四题平均值；第 25 题对所选维度做 `×1.10` 的相对加权，然后归一化为六维人格比例。竞赛匹配严格使用参考截图中的维度权重：

`匹配度 = Σ（个人维度比例 × 赛事对应维度权重）`

截图中的 26 项赛事权重集中保存在 `contest-weights.js`，前端结果和后端入库使用同一份表。它表示赛事侧重点，不代表学生能力或获奖概率。

测试只反映自我报告的兴趣倾向，不是心理诊断，也不是经验证的人格测验。上线前请学校确认隐私告知、数据保留与删除流程、HTTPS、备份及管理员密码管理。当前 JSON 文件存储仅适合本地原型验证。
