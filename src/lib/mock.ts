// Mock data for demo purposes

// 模拟圈子帖子数据
export const mockCirclePosts = [
  {
    pin_id: 'mock_1',
    content: '最近在做推荐系统的技术选型，调研了 Redis、Memcached、Cassandra 等方案，有经验的兄弟能聊聊实际生产环境的选择吗？',
    author_name: '技术架构师小李',
    publish_time: Date.now() / 1000 - 3600 * 2,
    like_num: 15,
    comment_num: 8,
  },
  {
    pin_id: 'mock_2',
    content: '作为产品经理，经常被技术问"这个需求到底要解决什么问题"，但我自己也很难快速抽象出业务逻辑，求指教如何提升？',
    author_name: '产品经理小王',
    publish_time: Date.now() / 1000 - 3600 * 5,
    like_num: 23,
    comment_num: 12,
  },
  {
    pin_id: 'mock_3',
    content: '独立开发做了一个 AI 写作助手，但不知道怎么推广，有运营或者增长高手愿意交流一下吗？可以交换技术能力',
    author_name: '独立开发者阿强',
    publish_time: Date.now() / 1000 - 3600 * 8,
    like_num: 31,
    comment_num: 18,
  },
  {
    pin_id: 'mock_4',
    content: '视觉设计师，擅长 C 端产品设计，最近想学学 B 端设计规范，有推荐的课程或者书籍吗？',
    author_name: '设计师小美',
    publish_time: Date.now() / 1000 - 3600 * 12,
    like_num: 9,
    comment_num: 5,
  },
  {
    pin_id: 'mock_5',
    content: '创业做 SaaS 产品，现金流快断了，有投资或者商业化经验的大佬愿意聊聊吗？可以做技术顾问',
    author_name: '创业小陈',
    publish_time: Date.now() / 1000 - 3600 * 24,
    like_num: 45,
    comment_num: 32,
  },
]

// 模拟互补匹配结果
export const mockMatchResults = [
  {
    post: mockCirclePosts[1], // 产品经理小王
    matchScore: 0.85,
    matchReason: '你的技术背景可以帮他解决"技术架构判断"短板，他可以帮你提升"产品抽象表达"',
    complementType: '能力互补',
    reason: {
      complementType: '能力互补',
      thesis: {
        forYou: '你的技术架构 → 解决他技术选型困境',
        forThem: '他的产品视角 → 弥补你需求表达短板',
      },
      detailLevel: 'detailed',
    },
    detailLevel: 'detailed',
  },
  {
    post: mockCirclePosts[3], // 设计师小美
    matchScore: 0.72,
    matchReason: '你的产品思维可以帮她理解用户需求，她的视觉能力可以帮你提升产品体验',
    complementType: '认知互补',
    reason: {
      complementType: '认知互补',
      thesis: {
        forYou: '你的产品思维 → 帮她理解B端用户需求',
        forThem: '',
      },
      detailLevel: 'brief',
    },
    detailLevel: 'brief',
  },
]

// 模拟协商数据
export const mockNegotiationRounds = [
  {
    roundNumber: 1,
    speaker: 'my_agent',
    summary: '我当前的核心问题是：作为技术背景的产品经理，常被技术问需求背后的业务逻辑，难以快速抽象',
  },
  {
    roundNumber: 2,
    speaker: 'peer_proxy',
    summary: '对方能提供：PRD 梳理、需求分析方法论；需要：从技术视角理解实现可行性',
  },
  {
    roundNumber: 3,
    speaker: 'my_agent',
    summary: '我的边界：每周最多投入 2 小时做深度交流，不接受长期合作',
  },
  {
    roundNumber: 4,
    speaker: 'peer_proxy',
    summary: '最小合作形式：一次 30 分钟的问题对焦会议，我先帮他拆解一个具体需求',
  },
  {
    roundNumber: 5,
    speaker: 'my_agent',
    summary: '建议继续：双方有明确的价值交换，且时间投入可控',
  },
]

// 模拟协商结果
export const mockNegotiationResult = {
  consensus: '适合先做一次 30 分钟问题对焦，用户 A 帮用户 B 梳理需求，用户 B 分享技术选型经验',
  recommendedForm: '30分钟问题对焦 + 技术经验分享',
  recommendedDuration: '30分钟/次',
  shouldContinue: true,
}

// 模拟提案数据
export const mockProposal = {
  id: 'proposal_1',
  topic: '推荐系统技术选型互助',
  complementReason: '双方在同一讨论里呈现明显互补',
  offerSummary: 'PRD 与问题拆解能力',
  need_summary: '技术架构判断与实现可行性评估',
  collaborationType: '30分钟互助对话',
  status: 'pending',
  createdAt: new Date(),
}

// 候选代理数据
export const mockCandidateProxy = {
  targetToken: 'mock_user_001',
  estimatedStrengths: 'PRD梳理,需求分析,产品规划',
  estimatedNeeds: '技术架构判断,工程落地经验',
  estimatedOffers: '产品抽象,用户研究',
  communicationStyle: '理性、结构化、注重逻辑',
  confidence: 0.75,
}
