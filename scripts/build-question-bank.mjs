import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const rawDir = path.join(root, "work", "raw");
const outFile = path.join(root, "src", "questionBank.ts");

const readJson = (name) =>
  JSON.parse(fs.readFileSync(path.join(rawDir, name), "utf8"));

const studentMbti = readJson("student-mbti-raw.json");
const motivation = readJson("motivation-raw.json");
const vark = readJson("vark-raw.json");
const cognition = readJson("cognition-raw.json");
const guardianMbti = readJson("guardian-mbti-raw.json");

const studentMetaTitles = new Set(["姓名", "学校名称", "年级"]);
const motivationMetaTitles = new Set(["姓名", "性别", "年级"]);
const varkMetaTitles = new Set(["姓名：", "学校名称：", "年级："]);
const cognitionMetaTitles = new Set(["姓名", "性别", "年级"]);

const normalizeQuestion = (question, index, surveyKey, includeTrait = false) => ({
  id: `${surveyKey}-${index + 1}`,
  sourceQuestionId: question.id,
  prompt: question.title,
  options: (question.options ?? []).map((option, optionIndex) => ({
    id: option.id || `${question.id}-option-${optionIndex + 1}`,
    label: option.text || option.name,
    trait: includeTrait ? option.character_type || "" : undefined,
  })),
});

const dedupeStudentMbti = () => {
  const seen = new Set();
  const unique = [];
  for (const question of studentMbti.questions) {
    if (studentMetaTitles.has(question.title)) {
      continue;
    }
    const fingerprint = [
      question.title,
      question.type,
      ...(question.options ?? []).map((option) => option.text),
    ].join("::");
    if (seen.has(fingerprint)) {
      continue;
    }
    seen.add(fingerprint);
    unique.push(question);
  }
  return unique;
};

const studentMbtiQuestions = dedupeStudentMbti();
const motivationQuestions = motivation.questions.filter(
  (question) => !motivationMetaTitles.has(question.title),
);
const varkQuestions = vark.questions.filter(
  (question) => !varkMetaTitles.has(question.title),
);
const cognitionQuestions = cognition.questions.filter(
  (question) => !cognitionMetaTitles.has(question.title),
);
const guardianQuestions = guardianMbti.data.list;

const expectedCounts = {
  studentMbti: 24,
  learningMotivation: 16,
  vark: 20,
  cognition: 18,
  guardianMbti: 93,
};

const countChecks = {
  studentMbti: studentMbtiQuestions.length,
  learningMotivation: motivationQuestions.length,
  vark: varkQuestions.length,
  cognition: cognitionQuestions.length,
  guardianMbti: guardianQuestions.length,
};

for (const [key, value] of Object.entries(expectedCounts)) {
  if (countChecks[key] !== value) {
    throw new Error(`Unexpected question count for ${key}: ${countChecks[key]} !== ${value}`);
  }
}

const data = {
  ownerLabel: "AI 提分叶路春",
  sourceNotes: [
    "学生 MBTI 链接原始接口包含一页重复题目，这里按唯一题去重为 24 题。",
    "学生信息统一在档案页收集，因此从其余问卷中移除了重复的姓名、性别、学校、年级字段。",
  ],
  profile: {
    gradeOptions: ["初一", "初二", "初三", "高一", "高二", "高三"],
    genderOptions: ["男", "女"],
    guardianRoleOptions: ["妈妈", "爸爸", "其他监护人", "负责学习的家长"],
    subjectFields: [
      { key: "chinese", label: "语文" },
      { key: "math", label: "数学" },
      { key: "english", label: "英语" },
      { key: "physics", label: "物理" },
      { key: "chemistry", label: "化学" },
      { key: "biology", label: "生物" },
      { key: "politics", label: "政治" },
      { key: "history", label: "历史" },
      { key: "geography", label: "地理" },
    ],
  },
  surveys: [
    {
      key: "studentMbti",
      title: "MBTI 测评",
      shortTitle: "MBTI 测评",
      audience: "student",
      intro:
        "帮助了解学生在社交、学习和决策中的偏好，为个性化沟通与培养提供线索。",
      sourceTitle: studentMbti.title,
      sourceUrl: "https://wj.qq.com/s2/21493939/b352/",
      questions: studentMbtiQuestions.map((question, index) =>
        normalizeQuestion(question, index, "studentMbti"),
      ),
    },
    {
      key: "learningMotivation",
      title: "学习动力测评",
      shortTitle: "学习动力",
      audience: "student",
      intro: "了解学生当下的学习驱动力、偏好和压力反应。",
      sourceTitle: motivation.title,
      sourceUrl: "https://wj.qq.com/s2/21498538/0c6f/",
      questions: motivationQuestions.map((question, index) =>
        normalizeQuestion(question, index, "learningMotivation"),
      ),
    },
    {
      key: "vark",
      title: "VARK 学习风格测评",
      shortTitle: "VARK 风格",
      audience: "student",
      intro: "观察学生偏好的信息吸收方式，为后续学习方案设计提供基础。",
      sourceTitle: vark.title,
      sourceUrl: "https://wj.qq.com/s2/21491225/ea92/",
      questions: varkQuestions.map((question, index) =>
        normalizeQuestion(question, index, "vark"),
      ),
    },
    {
      key: "cognition",
      title: "学习认知测评",
      shortTitle: "学习认知",
      audience: "student",
      intro: "聚焦学习效率、精度和深度相关的认知习惯。",
      sourceTitle: cognition.title,
      sourceUrl: "https://wj.qq.com/s2/21505440/6a1e/",
      questions: cognitionQuestions.map((question, index) =>
        normalizeQuestion(question, index, "cognition"),
      ),
    },
    {
      key: "guardianMbti",
      title: "MBTI 测评（家长 93 题版）",
      shortTitle: "家长 MBTI",
      audience: "guardian",
      intro:
        "由负责学习的家长填写，帮助理解家庭互动风格与沟通偏好。",
      sourceTitle: guardianMbti.data.name,
      sourceUrl: "https://iot.ecocloud.cn:3100/test/",
      questions: guardianQuestions.map((question, index) => ({
        id: `guardianMbti-${index + 1}`,
        sourceQuestionId: String(question.id),
        prompt: question.name,
        options: question.option.map((option) => ({
          id: String(option.id),
          label: option.name,
          trait: option.character_type,
        })),
      })),
    },
  ],
};

const output = `import type { SurveyCatalog } from "./types";

export const SURVEY_CATALOG: SurveyCatalog = ${JSON.stringify(data, null, 2)} as const;
`;

fs.writeFileSync(outFile, output);
console.log(`Question bank written to ${path.relative(root, outFile)}`);
