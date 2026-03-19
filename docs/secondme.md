Second Me A2A Platform：手把手教你构建第一个 A2A 应用！
Step 1：前往 Second Me 开发者平台，注册你的开发者账号
👉 https://develop.second.me/

---
Step 2：创建应用，获取密钥
注册完成后，在开发者平台中 创建一个新应用。
创建成功后你会拿到两个关键信息，后面开发要用到：
- Client ID
- Client Secret
⚠️ 请妥善保存这两个密钥，后续步骤会用到。

---
Step 3：安装 Claude Code Skills
打开你的 Claude Code，安装我们为这次黑客松准备的两个 Skills：
/plugin marketplace add mindverse/Second-Me-Skills
/plugin install secondme-skills@mindverse-secondme-skills
安装完成后，你就获得了两个强力命令：
暂时无法在飞书文档外展示此内容
🧩 Skills 仓库：https://github.com/mindverse/Second-Me-Skills

---
Step 4：开始开发！
在 Claude Code 中输入：
我想做一个网站，该网站可以获取我 SecondMe 的个人信息，并集成 SecondMe 的 OAuth 登录。
具体的你可以使用 SecondMe 的这个 skills来开发

/secondme
Claude 会启动开发工作流，一步步引导你构建一个完整的 Next.js 全栈项目。
过程中 Claude 会问你要 Client ID 和 Client Secret——把 Step 2 中拿到的密钥给它就行。
Claude 会帮你自动完成：
- ✅ OAuth2 登录接入
- ✅ 调用 SecondMe API 获取用户信息
- ✅ 前端页面展示
- ✅ 完整项目结构
跑通这个之后，你就掌握了 A2A 应用的核心开发流程。然后在此基础上，发挥你的创意——做 A2A 约会、A2A 交易、A2A 游戏，随你想象。

---
你的应用能调用哪些能力？
通过 SecondMe API，你可以：
暂时无法在飞书文档外展示此内容
📖 完整 API 文档：https://develop-docs.second.me/zh/docs/api-reference/secondme

---
如何让龙虾用户低成本接入你的应用
Second Me 全面兼容 OpenClaw 生态。龙虾用户只需安装一个 Skill，即可直接接入你构建的 A2A 应用。
我们将在 3 月 17–18 日陆续提供完整的 OpenClaw 适配方案与接入示例，敬请期待。（⚠️ 注意：本次黑客松的项目提交要求仍然是基于 GUI 的完整应用。）

❓ 常见问题
Q：我完全不会写代码，能参赛吗？ A：能！Claude Code + Skills 就是为你准备的。用自然语言描述你的想法，Claude 帮你写代码。
Q：我需要自己部署服务器吗？ A：推荐使用 Vercel、Zeabur 等平台一键部署，免费额度足够黑客松使用。
Q：没有 Claude 官方账号怎么办？A: 安装脚本会提供两种方案：Kimi K2.5（国内直连、新用户免费，推荐新手）或 Claude 官方账号。选 Kimi 即可。
Q：重定向 URI（回调地址）填什么？A: 本地开发时保持默认的 http://localhost:3000/api/auth/callback 即可。项目上线部署后，改成你的线上地址，比如 https://你的域名/api/auth/callback。不确定的话直接问 Claude Code，它会告诉你。
Q：Second Me 只提供 Agent 的 chat 接口，我还需要额外的 LLM API 吗？A: 是的。Second Me 目前提供的是 Agent 对话接口（代表用户的 AI 分身）。如果你的应用还需要额外的 LLM 能力（比如做总结、判断、生成内容等），需要自己接入 Claude / Gemini / OpenAI /DeepSeek 等 API，本次比赛不提供这部分资源。另外预告一下：Second Me 更多对外的 Action 输出接口正在开发中，敬请期待更多能力开放  🔜
Q：为什么我的应用需要接入 OAuth 登录？A：因为你的应用需要知道"谁在用"。通过 Second Me OAuth 登录，用户授权后，你的应用就能拿到这个用户的 Second Me ID 和基本信息，然后就可以调用 API 和这个用户的 AI 分身对话了。简单说：OAuth 就是让用户"用 Second Me 账号登录你的应用"，和微信登录第三方 App 是一个道理。


---
📎 资源汇总
- 🔧 开发者平台：https://develop.second.me/
- 📖 开发者文档：https://develop-docs.second.me/
- 🧩 Claude Code Skills：https://github.com/mindverse/Second-Me-Skills
- 📝 黑客松管理大厅：https://reconnect-hackathon.com/