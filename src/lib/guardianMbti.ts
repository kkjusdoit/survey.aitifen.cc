import type { AnswerMap, SurveyDefinition } from "../types";

const dimensions = [
  ["E", "I", "能量投向"],
  ["S", "N", "信息偏好"],
  ["T", "F", "决策方式"],
  ["J", "P", "节奏风格"],
] as const;

interface GuardianMbtiProfile {
  typeName: string;
  tagline: string;
  headline: string;
  overview: string;
  communication: string;
  strengths: string[];
  watchouts: string[];
  palette: {
    accent: string;
    soft: string;
  };
}

const profileMap: Record<string, GuardianMbtiProfile> = {
  ISTJ: {
    typeName: "稳进型家长",
    tagline: "重秩序、重落实、重长期稳定",
    headline: "你往往会先把规则和节奏铺好，希望孩子在清晰边界里稳稳前进。",
    overview:
      "你习惯先把学习安排、时间分配和执行标准想清楚，再一步步推进。孩子通常能从你这里获得稳定感和清楚的期待。",
    communication:
      "和孩子沟通时，先讲事实和具体安排最容易被你接受；如果再补一句原因和鼓励，会让孩子更愿意配合。",
    strengths: ["执行力强，能把计划真正落地", "边界清楚，孩子容易知道什么该做", "遇到关键节点时通常可靠又稳当"],
    watchouts: ["别只盯结果，也要看孩子当下的承受度", "当孩子节奏慢时，先确认卡点，再谈要求", "适当给孩子一点试错空间，关系会更松弛"],
    palette: { accent: "#4067b1", soft: "#dfe9ff" },
  },
  ISFJ: {
    typeName: "守护型家长",
    tagline: "细心照顾、稳定支持、愿意长期陪伴",
    headline: "你通常会把孩子的情绪、状态和日常细节都放在心上，是很有耐心的陪跑者。",
    overview:
      "你擅长在细节里照顾孩子，也愿意默默承担很多支持工作。孩子往往会感受到你持续而稳定的托举。",
    communication:
      "你更适合用温和、具体、可执行的方式和孩子交流。先理解感受，再谈调整，会比直接纠正更有效。",
    strengths: ["能提供稳定陪伴和安全感", "关注细节，容易发现孩子状态变化", "愿意长期投入，不轻易放弃"],
    watchouts: ["别因为怕孩子受挫就替他承担太多", "过度包揽会削弱孩子自主性", "需要给自己留出情绪恢复空间"],
    palette: { accent: "#4a7a62", soft: "#e1f3e7" },
  },
  INFJ: {
    typeName: "洞察型家长",
    tagline: "看重成长意义，也关注关系深度",
    headline: "你不仅关心成绩，更在意孩子会成长成什么样的人。",
    overview:
      "你常常能从孩子表面的表现里看到背后的情绪和动机，也愿意用更长远的眼光看待教育这件事。",
    communication:
      "你适合用启发式提问和深度对话打开孩子，而不是密集说教。给孩子表达空间，往往能聊到真正的问题。",
    strengths: ["擅长看见孩子的潜力和内在需求", "沟通有温度，也有方向感", "容易建立有信任感的亲子关系"],
    watchouts: ["不要把期待藏得太深，让孩子猜你的心思", "高理想标准可能让孩子感到无形压力", "复杂问题尽量拆成可执行的小步骤"],
    palette: { accent: "#6b56a7", soft: "#eee6ff" },
  },
  INTJ: {
    typeName: "策略型家长",
    tagline: "目标感强，喜欢从系统和方法上解决问题",
    headline: "你倾向于把教育当作长期工程，会主动思考路径、策略和资源配置。",
    overview:
      "你习惯从全局看问题，重视效率和成长路线。孩子在你这里常常能得到清晰方向和升级思路。",
    communication:
      "你和孩子沟通时，最好先讲重点和逻辑，再补充情绪上的理解。这样既保留你的效率，也更容易被孩子接住。",
    strengths: ["擅长规划长期路径", "发现问题后能迅速抽丝剥茧", "愿意投入资源解决关键瓶颈"],
    watchouts: ["别让高标准压过了亲子连接", "当孩子还没准备好时，少一点推演，多一点陪伴", "不要默认孩子和你一样擅长自驱"],
    palette: { accent: "#4b4f8f", soft: "#e3e5ff" },
  },
  ISTP: {
    typeName: "务实型家长",
    tagline: "冷静直接，遇事先看怎么解决",
    headline: "你面对孩子问题时往往很实在，先看现状，再想办法把问题处理掉。",
    overview:
      "你不喜欢空谈，更相信有效的方法和实际结果。孩子会觉得你遇事不慌，关键时候有主意。",
    communication:
      "和孩子交流时，短句、重点、解决方案会更符合你的节奏；但如果先听一会儿，孩子会更愿意打开心门。",
    strengths: ["处理具体问题时反应快", "不容易被情绪带跑", "能帮助孩子把大问题拆成小动作"],
    watchouts: ["别太快进入解决模式，先理解孩子在难受什么", "冷静不等于无感，适当表达关心很重要", "长期学习问题也需要持续陪伴而不只是修补"],
    palette: { accent: "#6a7284", soft: "#e9edf5" },
  },
  ISFP: {
    typeName: "温柔型家长",
    tagline: "尊重感受，愿意给孩子空间",
    headline: "你通常更愿意先保护孩子的感受，再慢慢推动改变。",
    overview:
      "你重视关系里的舒适感和被理解感，不喜欢生硬强压。孩子在你面前更容易放松，也更愿意表达真实情绪。",
    communication:
      "温和、具体、不带评判的表达很适合你。你越能把关心说清楚，孩子越能真正接收到你的支持。",
    strengths: ["亲和力强，容易建立信任", "尊重孩子差异，不轻易贴标签", "能在压力期给孩子缓冲和安定"],
    watchouts: ["别因为怕冲突就回避原则问题", "适度立边界，孩子会更有安全感", "重要节点上需要更明确地推动执行"],
    palette: { accent: "#b56f48", soft: "#ffe9dc" },
  },
  INFP: {
    typeName: "共情型家长",
    tagline: "重理解、重价值、重内在成长",
    headline: "你很在意孩子是不是被真正理解，也希望教育能保护住孩子的独特性。",
    overview:
      "你容易看见孩子内心的柔软处，也愿意用理解和尊重陪孩子慢慢长大。孩子常会在你这里感到被接纳。",
    communication:
      "适合用真诚、平等、不过度评判的方式交流。先让孩子说，再帮他一起理清，会比直接下结论更有效。",
    strengths: ["共情能力强，亲子关系有温度", "擅长保护孩子自尊和内驱力", "更愿意看见孩子这个人，而不只是成绩"],
    watchouts: ["别把理解误成无限让步", "需要把支持转成更清楚的行动边界", "当问题反复出现时，要敢于推进落实"],
    palette: { accent: "#9a5fa8", soft: "#f4e7fb" },
  },
  INTP: {
    typeName: "思辨型家长",
    tagline: "爱分析、重逻辑、喜欢找到本质",
    headline: "你通常不满足于表面现象，更想弄清楚孩子问题背后的真正原因。",
    overview:
      "你擅长拆解复杂情况，对方法和原理都很敏感。孩子如果愿意和你深聊，常能获得新的视角。",
    communication:
      "你适合用探讨式沟通，但要注意别把亲子对话变成辩论赛。先确认孩子感受，再聊逻辑，效果更好。",
    strengths: ["分析问题有深度", "能跳出表面成绩看学习机制", "遇到复杂难题时容易找到关键点"],
    watchouts: ["别让解释太多、行动太少", "孩子脆弱时需要陪伴，不只需要道理", "复杂方案最好简化成能执行的几步"],
    palette: { accent: "#5a6cb0", soft: "#e5ebff" },
  },
  ESTP: {
    typeName: "推动型家长",
    tagline: "行动快，执行猛，遇事不拖",
    headline: "你通常节奏明快，看到问题就想立刻处理，也很擅长把气氛带起来。",
    overview:
      "你有现实判断和行动魄力，不喜欢反复空转。孩子常会觉得你很有能量，也能在关键时刻把事情往前推。",
    communication:
      "直来直往是你的优势，但和孩子互动时，先停半拍听完，会比立刻下结论更容易达成一致。",
    strengths: ["行动力强，能迅速推进改变", "遇到突发情况时反应快", "容易把低迷状态重新拉回节奏"],
    watchouts: ["别把快节奏变成持续施压", "孩子慢热时需要更多等待", "重要原则不能只靠临场推动，要有连续跟进"],
    palette: { accent: "#c05a3b", soft: "#ffe5da" },
  },
  ESFP: {
    typeName: "活力型家长",
    tagline: "热情外放，擅长给孩子情绪能量",
    headline: "你往往能把陪伴做得很有温度，也会主动让孩子感受到支持和鼓励。",
    overview:
      "你擅长营造轻松的互动氛围，让孩子不容易在关系里紧绷。很多时候，你的存在本身就是孩子的能量补给。",
    communication:
      "鼓励式、陪伴式、互动感强的沟通很适合你。只要再多一点持续性和规则感，效果会更完整。",
    strengths: ["会鼓励人，能给孩子信心", "关系热络，孩子不容易疏远", "擅长用体验和互动带动学习状态"],
    watchouts: ["别只靠情绪推动，重要事项要有落地安排", "避免因为心软而反复放松标准", "当孩子状态反复时，需要更稳定的跟进"],
    palette: { accent: "#d27a2e", soft: "#fff0d8" },
  },
  ENFP: {
    typeName: "启发型家长",
    tagline: "热情有想法，擅长点燃孩子的内在动力",
    headline: "你更像一个会点火的人，常能看见孩子的可能性，并愿意把那份光亮激发出来。",
    overview:
      "你乐于鼓励、启发和打开思路，不太喜欢把教育做成机械管理。孩子容易从你这里获得信心和希望感。",
    communication:
      "你很适合用鼓励、提问、联想的方式和孩子互动。只要再把重要要求说得更具体，落地效果会更强。",
    strengths: ["能激发孩子兴趣和主动性", "容易看见潜力，不轻易否定", "亲子对话有活力，关系不容易僵"],
    watchouts: ["别只顾灵感和愿景，也要照看执行细节", "方向太多时，孩子可能反而无从下手", "重要目标要收束成有限重点"],
    palette: { accent: "#d06b6b", soft: "#ffe6e6" },
  },
  ENTP: {
    typeName: "创想型家长",
    tagline: "脑子快、点子多、喜欢打开新可能",
    headline: "你常常能给孩子带来新视角，也会推动他们跳出固定思路看问题。",
    overview:
      "你擅长发现更多可能，不容易被单一路径限制。孩子如果愿意跟你交流，常能被你带出更开阔的思考空间。",
    communication:
      "你适合用讨论、追问、碰撞想法的方式沟通，但也要注意控制强度，不让孩子觉得一直在被挑战。",
    strengths: ["思路活，能快速打开局面", "不容易被旧方法绑住", "能帮助孩子建立更灵活的问题视角"],
    watchouts: ["别把频繁质疑变成孩子的压力源", "创意很多时，要帮孩子收束成可执行方案", "对年纪小的孩子要减少过度抽象表达"],
    palette: { accent: "#8b5ec9", soft: "#efe6ff" },
  },
  ESTJ: {
    typeName: "统筹型家长",
    tagline: "重目标、重秩序、重结果推进",
    headline: "你通常很会组织和管理，也希望孩子的学习能有标准、有节奏、有产出。",
    overview:
      "你重视责任和效率，不喜欢拖沓和模糊。孩子在你这里往往能获得明确要求，也能看到清楚的推进方向。",
    communication:
      "你更适合直截了当表达目标，但如果先补一句理解，再给要求，孩子会更愿意合作而不是防御。",
    strengths: ["目标清楚，执行推进强", "善于管理时间与规则", "关键阶段能迅速建立秩序感"],
    watchouts: ["不要把亲子关系长期放在指令模式里", "孩子需要被理解，而不只是被管理", "注意给孩子保留自主表达空间"],
    palette: { accent: "#3e7f98", soft: "#dff3fb" },
  },
  ESFJ: {
    typeName: "支持型家长",
    tagline: "热心投入，擅长用关系和陪伴推动成长",
    headline: "你很愿意为孩子付出，也常常把家庭支持做得非常具体和到位。",
    overview:
      "你关注孩子是否被照顾好，也在意学习氛围是否和谐顺畅。孩子通常能感受到你稳定且外显的支持。",
    communication:
      "你适合用关怀和明确提醒并行的方式交流。先让孩子感受到你站在他这边，再谈规则，接受度更高。",
    strengths: ["陪伴感强，孩子不容易感到孤立", "能把支持落实到日常细节", "善于维持家庭中的合作氛围"],
    watchouts: ["别因为太想帮而变成持续催促", "有时要放手让孩子自己承担结果", "注意不要把自己的焦虑包进关心里"],
    palette: { accent: "#c26752", soft: "#ffe6df" },
  },
  ENFJ: {
    typeName: "引导型家长",
    tagline: "会带方向，也会带温度",
    headline: "你既关心孩子的当下情绪，也想把他们往更好的方向稳稳带过去。",
    overview:
      "你通常兼顾关系和目标，擅长鼓励、协调和带动他人。孩子容易从你这里得到方向感，也会感到被看见。",
    communication:
      "你很适合用有温度但有重点的方式沟通。先连上情绪，再提出期望和建议，常常能形成更好的合作。",
    strengths: ["能同时兼顾鼓励与推动", "对孩子情绪和成长方向都比较敏感", "容易建立愿意沟通的亲子氛围"],
    watchouts: ["别承担过多情绪责任，把自己耗得太满", "当孩子不配合时，先分清是状态问题还是原则问题", "高投入也要留白，避免关系过度紧绷"],
    palette: { accent: "#a5577f", soft: "#f9e3ef" },
  },
  ENTJ: {
    typeName: "领航型家长",
    tagline: "方向明确，擅长把资源和行动组织起来",
    headline: "你往往会自然地站到带路的位置，希望孩子不仅努力，还要走在更有效的路径上。",
    overview:
      "你重视效率、目标和成长速度，善于统筹资源、制定计划、推动执行。孩子常会感受到你很有方向感。",
    communication:
      "你适合讲清目标和方法，但也要刻意留一点提问和倾听空间。孩子被看见后，才更愿意跟上你的节奏。",
    strengths: ["很会定方向和抓关键", "推进力强，容易带来实质进展", "遇到复杂局面时能迅速整合资源"],
    watchouts: ["别把高要求变成持续压迫感", "并不是每个孩子都能立刻接住高强度推进", "关系需要温度，不能只剩目标管理"],
    palette: { accent: "#6d4eb0", soft: "#ebe3ff" },
  },
};

export interface GuardianMbtiResult {
  typeCode: string;
  typeName: string;
  tagline: string;
  headline: string;
  overview: string;
  communication: string;
  strengths: string[];
  watchouts: string[];
  palette: {
    accent: string;
    soft: string;
  };
  percentages: Array<{
    left: string;
    right: string;
    dominant: string;
    percentage: number;
    label: string;
  }>;
}

export function calculateGuardianMbti(
  survey: SurveyDefinition,
  answers: AnswerMap,
): GuardianMbtiResult | null {
  const counts: Record<string, number> = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };

  for (const question of survey.questions) {
    const answerId = answers[question.id];
    const option = question.options.find((item) => item.id === answerId);
    if (option?.trait) {
      counts[option.trait] += 1;
    }
  }

  const answered = Object.values(counts).some((count) => count > 0);
  if (!answered) {
    return null;
  }

  const typeCode = dimensions
    .map(([left, right]) => (counts[left] >= counts[right] ? left : right))
    .join("");

  const profile = profileMap[typeCode] ?? profileMap.ISTJ;

  const percentages = dimensions.map(([left, right, label]) => {
    const leftCount = counts[left];
    const rightCount = counts[right];
    const total = leftCount + rightCount || 1;
    const dominant = leftCount >= rightCount ? left : right;
    return {
      left,
      right,
      dominant,
      label,
      percentage: Math.round((Math.max(leftCount, rightCount) / total) * 100),
    };
  });

  return {
    typeCode,
    typeName: profile.typeName,
    tagline: profile.tagline,
    headline: profile.headline,
    overview: profile.overview,
    communication: profile.communication,
    strengths: profile.strengths,
    watchouts: profile.watchouts,
    palette: profile.palette,
    percentages,
  };
}
