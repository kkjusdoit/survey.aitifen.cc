import type { SurveyCatalog } from "./types";

export const SURVEY_CATALOG: SurveyCatalog = {
  "ownerLabel": "AI 提分叶路春",
  "sourceNotes": [
    "学生 MBTI 链接原始接口包含一页重复题目，这里按唯一题去重为 24 题。",
    "学生信息统一在档案页收集，因此从其余问卷中移除了重复的姓名、性别、学校、年级字段。"
  ],
  "profile": {
    "gradeOptions": [
      "初一",
      "初二",
      "初三",
      "高一",
      "高二",
      "高三"
    ],
    "genderOptions": [
      "男",
      "女"
    ],
    "guardianRoleOptions": [
      "妈妈",
      "爸爸",
      "其他监护人",
      "负责学习的家长"
    ],
    "subjectFields": [
      {
        "key": "chinese",
        "label": "语文"
      },
      {
        "key": "math",
        "label": "数学"
      },
      {
        "key": "english",
        "label": "英语"
      },
      {
        "key": "physics",
        "label": "物理"
      },
      {
        "key": "chemistry",
        "label": "化学"
      },
      {
        "key": "biology",
        "label": "生物"
      },
      {
        "key": "politics",
        "label": "政治"
      },
      {
        "key": "history",
        "label": "历史"
      },
      {
        "key": "geography",
        "label": "地理"
      }
    ]
  },
  "surveys": [
    {
      "key": "studentMbti",
      "title": "MBTI 测评（学生版）",
      "shortTitle": "学生 MBTI",
      "audience": "student",
      "intro": "帮助了解学生在社交、学习和决策中的偏好，为个性化沟通与培养提供线索。",
      "sourceTitle": "MBTI 学生版测评问卷——探索你的行为偏好 - 腾讯问卷",
      "sourceUrl": "https://wj.qq.com/s2/21493939/b352/",
      "questions": [
        {
          "id": "studentMbti-1",
          "sourceQuestionId": "q-3-abcd",
          "prompt": "假期时，你更喜欢",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "参加朋友聚会或活动"
            },
            {
              "id": "o-1-abcd",
              "label": "在家休息放松"
            }
          ]
        },
        {
          "id": "studentMbti-2",
          "sourceQuestionId": "q-4-abcd",
          "prompt": "在社交场合中，你更倾向于",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "观察，偶尔参与"
            },
            {
              "id": "o-1-abcd",
              "label": "参与讨论"
            }
          ]
        },
        {
          "id": "studentMbti-3",
          "sourceQuestionId": "q-5-abcd",
          "prompt": "在课堂上你更倾向于",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "主动回答问题"
            },
            {
              "id": "o-1-abcd",
              "label": "思考和观察"
            }
          ]
        },
        {
          "id": "studentMbti-4",
          "sourceQuestionId": "q-6-abcd",
          "prompt": "你在学校活动中更愿意",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "表现自己，成为焦点"
            },
            {
              "id": "o-1-abcd",
              "label": "辅助他人，从旁协助"
            }
          ]
        },
        {
          "id": "studentMbti-5",
          "sourceQuestionId": "q-7-abcd",
          "prompt": "在家庭聚会中，你通常会",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "主动参与讨论和互动"
            },
            {
              "id": "o-1-abcd",
              "label": "静静观察和聆听"
            }
          ]
        },
        {
          "id": "studentMbti-6",
          "sourceQuestionId": "q-8-abcd",
          "prompt": "当需要完成小组任务时，你更倾向于",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "积极组织讨论，推动进度"
            },
            {
              "id": "o-1-abcd",
              "label": "先独自思考，再分享想法"
            }
          ]
        },
        {
          "id": "studentMbti-7",
          "sourceQuestionId": "q-9-abcd",
          "prompt": "做作业时，你更喜欢",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "按计划完成每个任务"
            },
            {
              "id": "o-1-abcd",
              "label": "灵活处理，根据情况调整"
            }
          ]
        },
        {
          "id": "studentMbti-8",
          "sourceQuestionId": "q-10-abcd",
          "prompt": "解决问题时，你更注重",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "问题的整体框架"
            },
            {
              "id": "o-1-abcd",
              "label": "问题的具体细节"
            }
          ]
        },
        {
          "id": "studentMbti-9",
          "sourceQuestionId": "q-11-abcd",
          "prompt": "学习一门新课程时，你更在意",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "课程可能带来的新想法"
            },
            {
              "id": "o-1-abcd",
              "label": "课程的实际内容和步骤"
            }
          ]
        },
        {
          "id": "studentMbti-10",
          "sourceQuestionId": "q-12-abcd",
          "prompt": "学习新课题时，你更关注",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "实用性和具体事实"
            },
            {
              "id": "o-1-abcd",
              "label": "理论和长远想法"
            }
          ]
        },
        {
          "id": "studentMbti-11",
          "sourceQuestionId": "q-13-abcd",
          "prompt": "学习新内容你更倾向于",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "关注具体细节和实际应用"
            },
            {
              "id": "o-1-abcd",
              "label": "思考内容背后的含义和可能性"
            }
          ]
        },
        {
          "id": "studentMbti-12",
          "sourceQuestionId": "q-14-abcd",
          "prompt": "在做家庭作业时，你更喜欢",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "从实际内容出发，逐步理解"
            },
            {
              "id": "o-1-abcd",
              "label": "从整体上理解作业"
            }
          ]
        },
        {
          "id": "studentMbti-13",
          "sourceQuestionId": "q-15-abcd",
          "prompt": "父母提出学业建议时，你更重视",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "他们给出的实际建议和方法"
            },
            {
              "id": "o-1-abcd",
              "label": "他们的情感支持和理解"
            }
          ]
        },
        {
          "id": "studentMbti-14",
          "sourceQuestionId": "q-16-abcd",
          "prompt": "在帮助家人时，你通常会",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "给予建议和指导"
            },
            {
              "id": "o-1-abcd",
              "label": "提供情感支持和安慰"
            }
          ]
        },
        {
          "id": "studentMbti-15",
          "sourceQuestionId": "q-17-abcd",
          "prompt": "做作业遇到难题时，你更倾向于",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "冷静分析并找到合理的解答方法"
            },
            {
              "id": "o-1-abcd",
              "label": "咨询他人意见并考虑感受"
            }
          ]
        },
        {
          "id": "studentMbti-16",
          "sourceQuestionId": "q-18-abcd",
          "prompt": "朋友向你寻求建议时，你通常会",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "提供理性的意见"
            },
            {
              "id": "o-1-abcd",
              "label": "表达情感上的支持"
            }
          ]
        },
        {
          "id": "studentMbti-17",
          "sourceQuestionId": "q-19-abcd",
          "prompt": "当同学遇到困难时，你通常会",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "提出具体的解决办法"
            },
            {
              "id": "o-1-abcd",
              "label": "表达理解和支持"
            }
          ]
        },
        {
          "id": "studentMbti-18",
          "sourceQuestionId": "q-20-abcd",
          "prompt": "与朋友讨论学习时，你更倾向于",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "给出清晰的解答和逻辑"
            },
            {
              "id": "o-1-abcd",
              "label": "关心朋友的情绪和感受"
            }
          ]
        },
        {
          "id": "studentMbti-19",
          "sourceQuestionId": "q-21-abcd",
          "prompt": "在学期开始时，你更倾向于",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "事先规划好学习目标"
            },
            {
              "id": "o-1-abcd",
              "label": "根据需要，随时调整目标"
            }
          ]
        },
        {
          "id": "studentMbti-20",
          "sourceQuestionId": "q-22-abcd",
          "prompt": "你更喜欢哪种学习方式",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "通过具体事物、实际操作来学习"
            },
            {
              "id": "o-1-abcd",
              "label": "通过抽象概念和想象来理解"
            }
          ]
        },
        {
          "id": "studentMbti-21",
          "sourceQuestionId": "q-23-abcd",
          "prompt": "在复习计划方面，你更倾向于",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "列出每天的学习内容，按部就班地复习"
            },
            {
              "id": "o-1-abcd",
              "label": "随着复习进展不断调整内容"
            }
          ]
        },
        {
          "id": "studentMbti-22",
          "sourceQuestionId": "q-24-abcd",
          "prompt": "学习安排上，你更倾向于",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "制定清晰的计划并按步骤完成"
            },
            {
              "id": "o-1-abcd",
              "label": "根据状态灵活调整"
            }
          ]
        },
        {
          "id": "studentMbti-23",
          "sourceQuestionId": "q-25-abcd",
          "prompt": "和朋友计划假期活动时，你更喜欢",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "制定详细计划"
            },
            {
              "id": "o-1-abcd",
              "label": "随性安排"
            }
          ]
        },
        {
          "id": "studentMbti-24",
          "sourceQuestionId": "q-26-abcd",
          "prompt": "准备考试时，你更倾向于",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "制定复习计划并严格执行"
            },
            {
              "id": "o-1-abcd",
              "label": "根据学习状态调整计划"
            }
          ]
        }
      ]
    },
    {
      "key": "learningMotivation",
      "title": "学习动力测评",
      "shortTitle": "学习动力",
      "audience": "student",
      "intro": "了解学生当下的学习驱动力、偏好和压力反应。",
      "sourceTitle": "「Z世代学习动力测评」问卷 - 腾讯问卷",
      "sourceUrl": "https://wj.qq.com/s2/21498538/0c6f/",
      "questions": [
        {
          "id": "learningMotivation-1",
          "sourceQuestionId": "q-3-abcd",
          "prompt": "你在短视频平台新建账号，首条内容会是？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "用化学实验了解奶茶配方"
            },
            {
              "id": "o-1-abcd",
              "label": "晒出月考年级排名截图"
            },
            {
              "id": "o-2-abcd",
              "label": "翻跳偶像新歌舞蹈"
            }
          ]
        },
        {
          "id": "learningMotivation-2",
          "sourceQuestionId": "q-4-abcd",
          "prompt": "如果给朋友圈设置“学习状态标签”，你选择？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "知识探险日志"
            },
            {
              "id": "o-1-abcd",
              "label": "卷王养成日记"
            },
            {
              "id": "o-2-abcd",
              "label": "校园热搜制造机"
            }
          ]
        },
        {
          "id": "learningMotivation-3",
          "sourceQuestionId": "q-5-abcd",
          "prompt": "收到匿名学习挑战书，你的回应是？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "设计跨学科解密游戏，反挑战"
            },
            {
              "id": "o-1-abcd",
              "label": "查找对方成绩单，制定碾压计划"
            },
            {
              "id": "o-2-abcd",
              "label": "将挑战书改编成说唱Diss"
            }
          ]
        },
        {
          "id": "learningMotivation-4",
          "sourceQuestionId": "q-6-abcd",
          "prompt": "班级群突然爆火的原因可能是？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "有人上传了原创解题RAP"
            },
            {
              "id": "o-1-abcd",
              "label": "班主任公布了排名进步榜"
            },
            {
              "id": "o-2-abcd",
              "label": "匿名爆料了某同学的糗事"
            }
          ]
        },
        {
          "id": "learningMotivation-5",
          "sourceQuestionId": "q-7-abcd",
          "prompt": "好友给你分享“学习秘籍”，你希望是？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "错题基因改编成音乐"
            },
            {
              "id": "o-1-abcd",
              "label": "名校学霸的日程表Excel"
            },
            {
              "id": "o-2-abcd",
              "label": "防家长看手机的隐藏技巧"
            }
          ]
        },
        {
          "id": "learningMotivation-6",
          "sourceQuestionId": "q-8-abcd",
          "prompt": "校园艺术节你更愿意参与？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "用数学曲线设计灯光秀"
            },
            {
              "id": "o-1-abcd",
              "label": "担任颁奖成绩播报员"
            },
            {
              "id": "o-2-abcd",
              "label": "发起“最潮校服穿搭”投票"
            }
          ]
        },
        {
          "id": "learningMotivation-7",
          "sourceQuestionId": "q-9-abcd",
          "prompt": "获得“跨次元学习装备”，你选择？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "错题重组VR眼镜（将错题变成科幻电影）"
            },
            {
              "id": "o-1-abcd",
              "label": "分数预测罗盘（显示下次考试精确分数）"
            },
            {
              "id": "o-2-abcd",
              "label": "社牛扩音器（自动播报你的学习时长）"
            }
          ]
        },
        {
          "id": "learningMotivation-8",
          "sourceQuestionId": "q-10-abcd",
          "prompt": "如果学科变成手游角色，你会主练？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "语文·意象召唤师（用古诗生成战斗特效）"
            },
            {
              "id": "o-1-abcd",
              "label": "数学·速算刺客（30秒内击杀题库BOSS）"
            },
            {
              "id": "o-2-abcd",
              "label": "英语·语法偶像（收获虚拟粉丝打call）"
            }
          ]
        },
        {
          "id": "learningMotivation-9",
          "sourceQuestionId": "q-11-abcd",
          "prompt": "周末时间突然翻倍，你优先？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "在车库改造量子物理玩具"
            },
            {
              "id": "o-1-abcd",
              "label": "刷完所有押题密卷"
            },
            {
              "id": "o-2-abcd",
              "label": "直播「36小时学习马拉松」挑战"
            }
          ]
        },
        {
          "id": "learningMotivation-10",
          "sourceQuestionId": "q-12-abcd",
          "prompt": "面对难题卡壳时，你的大脑更像？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "死机电脑（蓝屏宕机需要重启）"
            },
            {
              "id": "o-1-abcd",
              "label": "搜索引擎（疯狂调用相似题套路）"
            },
            {
              "id": "o-2-abcd",
              "label": "黑客终端（尝试破解新路径）"
            }
          ]
        },
        {
          "id": "learningMotivation-11",
          "sourceQuestionId": "q-13-abcd",
          "prompt": "如果压力能实体化，你希望它是？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "可组装的乐高模型（拆解重组）"
            },
            {
              "id": "o-1-abcd",
              "label": "限时通关的游戏副本（击败即消失）"
            },
            {
              "id": "o-2-abcd",
              "label": "社交货币（兑换朋友圈夸夸券）"
            }
          ]
        },
        {
          "id": "learningMotivation-12",
          "sourceQuestionId": "q-14-abcd",
          "prompt": "考试前夜失眠，你选择？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "给物理定律写诗"
            },
            {
              "id": "o-1-abcd",
              "label": "背诵“蒙题口诀”到凌晨"
            },
            {
              "id": "o-2-abcd",
              "label": "在匿名树洞吐槽监考老师"
            }
          ]
        },
        {
          "id": "learningMotivation-13",
          "sourceQuestionId": "q-15-abcd",
          "prompt": "成绩波动时，你的手机屏保会换成？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "爱因斯坦吐舌头的表情包"
            },
            {
              "id": "o-1-abcd",
              "label": "班级排名表的截图"
            },
            {
              "id": "o-2-abcd",
              "label": "爱豆说“加油”的语音条"
            }
          ]
        },
        {
          "id": "learningMotivation-14",
          "sourceQuestionId": "q-16-abcd",
          "prompt": "学校开设“黑科技选修课”，你首选？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "用生物代码复活灭绝生物"
            },
            {
              "id": "o-1-abcd",
              "label": "AI生成完美答题模板"
            },
            {
              "id": "o-2-abcd",
              "label": "元宇宙虚拟校长竞选"
            }
          ]
        },
        {
          "id": "learningMotivation-15",
          "sourceQuestionId": "q-17-abcd",
          "prompt": "十年后母校邀请你演讲，主题是？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "《如何把兴趣变成超能力》"
            },
            {
              "id": "o-1-abcd",
              "label": "《从班级倒数到福布斯精英》"
            },
            {
              "id": "o-2-abcd",
              "label": "《千万粉知识网红的养成秘笈》"
            }
          ]
        },
        {
          "id": "learningMotivation-16",
          "sourceQuestionId": "q-18-abcd",
          "prompt": "如果知识能植入芯片，你选择？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "保留手动解码的乐趣"
            },
            {
              "id": "o-1-abcd",
              "label": "直接下载清北学霸同款"
            },
            {
              "id": "o-2-abcd",
              "label": "开启“学神滤镜”社交模式"
            }
          ]
        }
      ]
    },
    {
      "key": "vark",
      "title": "VARK 学习风格测评",
      "shortTitle": "VARK 风格",
      "audience": "student",
      "intro": "观察学生偏好的信息吸收方式，为后续学习方案设计提供基础。",
      "sourceTitle": "VARK学习风格模型测评问卷 - 腾讯问卷",
      "sourceUrl": "https://wj.qq.com/s2/21491225/ea92/",
      "questions": [
        {
          "id": "vark-1",
          "sourceQuestionId": "q-3-abcd",
          "prompt": "如果一个新同学要找到教室位置，你会如何帮忙？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "给他画一张校园地图并标明位置"
            },
            {
              "id": "o-1-abcd",
              "label": "写下路线让他看"
            },
            {
              "id": "o-2-abcd",
              "label": "带他一起过去"
            },
            {
              "id": "o-3-abcd",
              "label": "给他讲解路线怎么走"
            }
          ]
        },
        {
          "id": "vark-2",
          "sourceQuestionId": "q-4-abcd",
          "prompt": "你会如何学习使用一款新手机APP？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "观看视频教程"
            },
            {
              "id": "o-1-abcd",
              "label": "阅读APP的文字说明"
            },
            {
              "id": "o-2-abcd",
              "label": "听别人介绍如何使用"
            },
            {
              "id": "o-3-abcd",
              "label": "自己动手尝试操作"
            }
          ]
        },
        {
          "id": "vark-3",
          "sourceQuestionId": "q-5-abcd",
          "prompt": "如果你和朋友计划一起做一个班级活动，你会怎么制订计划？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "制作活动流程图或使用思维导图"
            },
            {
              "id": "o-1-abcd",
              "label": "写下详细的活动安排并分享给大家"
            },
            {
              "id": "o-2-abcd",
              "label": "与朋友讨论，听取他们的想法"
            },
            {
              "id": "o-3-abcd",
              "label": "自己动手布置活动场地"
            }
          ]
        },
        {
          "id": "vark-4",
          "sourceQuestionId": "q-6-abcd",
          "prompt": "如果你打算学一道新菜，你会怎么做？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "看视频教程或者图片指导"
            },
            {
              "id": "o-1-abcd",
              "label": "找一个详细的菜谱看看"
            },
            {
              "id": "o-2-abcd",
              "label": "听亲友讲解步骤和技巧"
            },
            {
              "id": "o-3-abcd",
              "label": "自己试着做一次"
            }
          ]
        },
        {
          "id": "vark-5",
          "sourceQuestionId": "q-7-abcd",
          "prompt": "如果同学向你咨询去过的一个景点，你会怎么介绍？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "给他看一些景点的照片"
            },
            {
              "id": "o-1-abcd",
              "label": "找一些景点的文字资料"
            },
            {
              "id": "o-2-abcd",
              "label": "详细口头描述景点特色"
            },
            {
              "id": "o-3-abcd",
              "label": "带他一起去体验"
            }
          ]
        },
        {
          "id": "vark-6",
          "sourceQuestionId": "q-8-abcd",
          "prompt": "如果你需要买一个新的书包，除了价格之外，你最关注什么？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "听售货员的讲解和推荐"
            },
            {
              "id": "o-1-abcd",
              "label": "亲自试背，看看舒适度"
            },
            {
              "id": "o-2-abcd",
              "label": "阅读标签上的材质和容量"
            },
            {
              "id": "o-3-abcd",
              "label": "书包的设计和颜色"
            }
          ]
        },
        {
          "id": "vark-7",
          "sourceQuestionId": "q-9-abcd",
          "prompt": "如果你想学一个新运动（如篮球或游泳），你会怎么学？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "找教练或朋友讲解要点"
            },
            {
              "id": "o-1-abcd",
              "label": "自己反复练习，直到掌握"
            },
            {
              "id": "o-2-abcd",
              "label": "阅读学习手册或说明书"
            },
            {
              "id": "o-3-abcd",
              "label": "观看教学视频"
            }
          ]
        },
        {
          "id": "vark-8",
          "sourceQuestionId": "q-10-abcd",
          "prompt": "在课堂上，老师要解释一个复杂的科学概念，你希望他怎么做？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "用简单的语言口头解释"
            },
            {
              "id": "o-1-abcd",
              "label": "用图表或模型辅助理解"
            },
            {
              "id": "o-2-abcd",
              "label": "用故事或文字来讲解"
            },
            {
              "id": "o-3-abcd",
              "label": "用实验或演示来说明"
            }
          ]
        },
        {
          "id": "vark-9",
          "sourceQuestionId": "q-11-abcd",
          "prompt": "当你学一款新软件时，你一般如何掌握操作？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "问朋友或老师请教使用方法"
            },
            {
              "id": "o-1-abcd",
              "label": "自己尝试每个功能并反复练习"
            },
            {
              "id": "o-2-abcd",
              "label": "阅读操作说明书或帮助文档"
            },
            {
              "id": "o-3-abcd",
              "label": "观看软件视频教程或图示"
            }
          ]
        },
        {
          "id": "vark-10",
          "sourceQuestionId": "q-12-abcd",
          "prompt": "你更喜欢哪种类型的网站？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "能够播放音频、视频和访谈内容的网站"
            },
            {
              "id": "o-1-abcd",
              "label": "提供丰富的文字和信息解释的网站"
            },
            {
              "id": "o-2-abcd",
              "label": "充满有趣视觉效果的网站"
            },
            {
              "id": "o-3-abcd",
              "label": "能够点击操作、互动体验的网站"
            }
          ]
        },
        {
          "id": "vark-11",
          "sourceQuestionId": "q-13-abcd",
          "prompt": "挑选一本书时，你更关注？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "文字内容丰富的书"
            },
            {
              "id": "o-1-abcd",
              "label": "朋友推荐的书"
            },
            {
              "id": "o-2-abcd",
              "label": "封面设计精美的书"
            },
            {
              "id": "o-3-abcd",
              "label": "真实事件或经验的记录书籍"
            }
          ]
        },
        {
          "id": "vark-12",
          "sourceQuestionId": "q-14-abcd",
          "prompt": "学习使用新手机，你最喜欢的学习方式是？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "阅读详细的说明书"
            },
            {
              "id": "o-1-abcd",
              "label": "让人直接讲解新功能如何使用"
            },
            {
              "id": "o-2-abcd",
              "label": "查看各项功能的示意图"
            },
            {
              "id": "o-3-abcd",
              "label": "自己尝试操作，摸索使用方法"
            }
          ]
        },
        {
          "id": "vark-13",
          "sourceQuestionId": "q-15-abcd",
          "prompt": "参加学校讲座时，你希望通过什么方式来理解内容？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "书面资料和文本材料"
            },
            {
              "id": "o-1-abcd",
              "label": "互动问答和讨论"
            },
            {
              "id": "o-2-abcd",
              "label": "现场演示和体验"
            },
            {
              "id": "o-3-abcd",
              "label": "使用图示、幻灯片辅助理解"
            }
          ]
        },
        {
          "id": "vark-14",
          "sourceQuestionId": "q-16-abcd",
          "prompt": "测试结束后，你希望老师用什么方式反馈你的表现？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "书面反馈报告"
            },
            {
              "id": "o-1-abcd",
              "label": "口头分析你的表现"
            },
            {
              "id": "o-2-abcd",
              "label": "使用数据图表展示你的成绩"
            },
            {
              "id": "o-3-abcd",
              "label": "结合实际案例来说明提升空间"
            }
          ]
        },
        {
          "id": "vark-15",
          "sourceQuestionId": "q-17-abcd",
          "prompt": "在餐厅点餐时，你更注重？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "阅读菜单上的文字描述"
            },
            {
              "id": "o-1-abcd",
              "label": "听服务员的推荐"
            },
            {
              "id": "o-2-abcd",
              "label": "以前吃过的、熟悉的菜品"
            },
            {
              "id": "o-3-abcd",
              "label": "看图片或摆盘吸引人的菜品"
            }
          ]
        },
        {
          "id": "vark-16",
          "sourceQuestionId": "q-18-abcd",
          "prompt": "在课堂上做演讲，你会如何准备？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "自己练习演讲内容，熟悉讲解流程"
            },
            {
              "id": "o-1-abcd",
              "label": "列出几个关键词，练习口头表达"
            },
            {
              "id": "o-2-abcd",
              "label": "写好演讲稿并多次阅读"
            },
            {
              "id": "o-3-abcd",
              "label": "制作图表和幻灯片来辅助讲解"
            }
          ]
        },
        {
          "id": "vark-17",
          "sourceQuestionId": "q-19-abcd",
          "prompt": "准备历史演讲时，你会通过什么方法了解演讲主题？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "参观博物馆或历史遗址，亲身体验"
            },
            {
              "id": "o-1-abcd",
              "label": "和老师或同学讨论，听取他们的看法"
            },
            {
              "id": "o-2-abcd",
              "label": "阅读关于这个主题的书籍或文章"
            },
            {
              "id": "o-3-abcd",
              "label": "找到相关的历史纪录片或短视频观看"
            }
          ]
        },
        {
          "id": "vark-18",
          "sourceQuestionId": "q-20-abcd",
          "prompt": "学习物理实验时，你会用什么方式理解实验？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "自己动手做实验，观察每一步的效果"
            },
            {
              "id": "o-1-abcd",
              "label": "听老师详细解释实验原理"
            },
            {
              "id": "o-2-abcd",
              "label": "阅读实验步骤说明书或课本内容"
            },
            {
              "id": "o-3-abcd",
              "label": "看实验演示视频或图解"
            }
          ]
        },
        {
          "id": "vark-19",
          "sourceQuestionId": "q-21-abcd",
          "prompt": "学习新的数学概念时，你希望怎么辅助理解？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "自己多做练习题，熟悉概念的应用"
            },
            {
              "id": "o-1-abcd",
              "label": "听老师详细讲解步骤和思路"
            },
            {
              "id": "o-2-abcd",
              "label": "观看解说视频或图片示例，理解概念的应用"
            },
            {
              "id": "o-3-abcd",
              "label": "阅读课本和讲义上的文字说明"
            }
          ]
        },
        {
          "id": "vark-20",
          "sourceQuestionId": "q-22-abcd",
          "prompt": "准备一场班级讨论时，你打算如何收集和整理你的观点？",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "与朋友交流，听取不同意见，完善自己的观点"
            },
            {
              "id": "o-1-abcd",
              "label": "列出主要观点，在心里演练讨论的过程"
            },
            {
              "id": "o-2-abcd",
              "label": "查找资料并阅读相关文献，获取更多信息"
            },
            {
              "id": "o-3-abcd",
              "label": "制作思维导图或图表，帮助自己理清思路"
            }
          ]
        }
      ]
    },
    {
      "key": "cognition",
      "title": "学习认知测评",
      "shortTitle": "学习认知",
      "audience": "student",
      "intro": "聚焦学习效率、精度和深度相关的认知习惯。",
      "sourceTitle": "中学生学习认知力测评问卷 - 腾讯问卷",
      "sourceUrl": "https://wj.qq.com/s2/21505440/6a1e/",
      "questions": [
        {
          "id": "cognition-1",
          "sourceQuestionId": "q-3-abcd",
          "prompt": "在学习新知识时，我会用思维导图梳理知识点",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        },
        {
          "id": "cognition-2",
          "sourceQuestionId": "q-4-abcd",
          "prompt": "我能像老师一样清楚地向同学讲解新知识",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是能"
            },
            {
              "id": "o-1-abcd",
              "label": "大部分能"
            },
            {
              "id": "o-2-abcd",
              "label": "有时能"
            },
            {
              "id": "o-3-abcd",
              "label": "很少能"
            },
            {
              "id": "o-4-abcd",
              "label": "从不能"
            }
          ]
        },
        {
          "id": "cognition-3",
          "sourceQuestionId": "q-5-abcd",
          "prompt": "对于复杂难懂的知识，我习惯用思维导图来帮助理解",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        },
        {
          "id": "cognition-4",
          "sourceQuestionId": "q-6-abcd",
          "prompt": "用费曼学习法讲解时，我能快速发现知识漏洞",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总能发现"
            },
            {
              "id": "o-1-abcd",
              "label": "大部分能发现"
            },
            {
              "id": "o-2-abcd",
              "label": "有时能发现"
            },
            {
              "id": "o-3-abcd",
              "label": "很少能发现"
            },
            {
              "id": "o-4-abcd",
              "label": "从不能发现"
            }
          ]
        },
        {
          "id": "cognition-5",
          "sourceQuestionId": "q-7-abcd",
          "prompt": "我会主动在不同学科使用思维导图",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是主动"
            },
            {
              "id": "o-1-abcd",
              "label": "经常主动"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔主动"
            },
            {
              "id": "o-3-abcd",
              "label": "很少主动"
            },
            {
              "id": "o-4-abcd",
              "label": "从不主动"
            }
          ]
        },
        {
          "id": "cognition-6",
          "sourceQuestionId": "q-8-abcd",
          "prompt": "我学习时会用简单的话复述知识来帮助理解",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是有意识"
            },
            {
              "id": "o-1-abcd",
              "label": "大部分有意识"
            },
            {
              "id": "o-2-abcd",
              "label": "有时有意识"
            },
            {
              "id": "o-3-abcd",
              "label": "很少有意识"
            },
            {
              "id": "o-4-abcd",
              "label": "从没有意识"
            }
          ]
        },
        {
          "id": "cognition-7",
          "sourceQuestionId": "q-9-abcd",
          "prompt": "我有整理错题本的习惯，并且会定期回顾错题",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        },
        {
          "id": "cognition-8",
          "sourceQuestionId": "q-10-abcd",
          "prompt": "我会分析错题原因，并做针对性练习",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        },
        {
          "id": "cognition-9",
          "sourceQuestionId": "q-11-abcd",
          "prompt": "我的错题本分类清晰，方便复习",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        },
        {
          "id": "cognition-10",
          "sourceQuestionId": "q-12-abcd",
          "prompt": "我会根据错题调整学习方法",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        },
        {
          "id": "cognition-11",
          "sourceQuestionId": "q-13-abcd",
          "prompt": "刻意练习时，我会设定目标并逐步提高难度",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        },
        {
          "id": "cognition-12",
          "sourceQuestionId": "q-14-abcd",
          "prompt": "我能坚持长期使用不同类型的错题本",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是能"
            },
            {
              "id": "o-1-abcd",
              "label": "大部分能"
            },
            {
              "id": "o-2-abcd",
              "label": "有时能"
            },
            {
              "id": "o-3-abcd",
              "label": "很少能"
            },
            {
              "id": "o-4-abcd",
              "label": "从不能"
            }
          ]
        },
        {
          "id": "cognition-13",
          "sourceQuestionId": "q-15-abcd",
          "prompt": "我会在课前主动预习，了解新课大概内容",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        },
        {
          "id": "cognition-14",
          "sourceQuestionId": "q-16-abcd",
          "prompt": "我用番茄工作法提高效率，专注学习 25 分钟后休息 5 分钟",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        },
        {
          "id": "cognition-15",
          "sourceQuestionId": "q-17-abcd",
          "prompt": "在课堂上，我积极思考并参与互动",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        },
        {
          "id": "cognition-16",
          "sourceQuestionId": "q-18-abcd",
          "prompt": "我能参考番茄工作法，合理安排学习和休息时间",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是能"
            },
            {
              "id": "o-1-abcd",
              "label": "大部分能"
            },
            {
              "id": "o-2-abcd",
              "label": "有时能"
            },
            {
              "id": "o-3-abcd",
              "label": "很少能"
            },
            {
              "id": "o-4-abcd",
              "label": "从不能"
            }
          ]
        },
        {
          "id": "cognition-17",
          "sourceQuestionId": "q-19-abcd",
          "prompt": "课后我会及时复习巩固当天知识",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        },
        {
          "id": "cognition-18",
          "sourceQuestionId": "q-20-abcd",
          "prompt": "我会根据任务难度，灵活调整番茄钟时长",
          "options": [
            {
              "id": "o-0-abcd",
              "label": "总是这样"
            },
            {
              "id": "o-1-abcd",
              "label": "经常这样"
            },
            {
              "id": "o-2-abcd",
              "label": "偶尔这样"
            },
            {
              "id": "o-3-abcd",
              "label": "很少这样"
            },
            {
              "id": "o-4-abcd",
              "label": "从不这样"
            }
          ]
        }
      ]
    },
    {
      "key": "guardianMbti",
      "title": "MBTI 测评（家长 93 题版）",
      "shortTitle": "家长 MBTI",
      "audience": "guardian",
      "intro": "由负责学习的家长填写，帮助理解家庭互动风格与沟通偏好。",
      "sourceTitle": "MBTI性格测试（93题）",
      "sourceUrl": "https://iot.ecocloud.cn:3100/test/",
      "questions": [
        {
          "id": "guardianMbti-1",
          "sourceQuestionId": "1",
          "prompt": "当你要外出一整天，你会",
          "options": [
            {
              "id": "1",
              "label": "计划你要做什么和在什么时候做",
              "trait": "J"
            },
            {
              "id": "2",
              "label": "说去就去",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-2",
          "sourceQuestionId": "2",
          "prompt": "你认为自己是一个",
          "options": [
            {
              "id": "3",
              "label": "较为有条理的人 ",
              "trait": "J"
            },
            {
              "id": "4",
              "label": "较为随兴所至的人",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-3",
          "sourceQuestionId": "3",
          "prompt": "假如你是一位老师，你会选教",
          "options": [
            {
              "id": "5",
              "label": "以事实为主的课程",
              "trait": "S"
            },
            {
              "id": "6",
              "label": "涉及理论的课程",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-4",
          "sourceQuestionId": "4",
          "prompt": "你通常",
          "options": [
            {
              "id": "7",
              "label": "与人容易混熟",
              "trait": "E"
            },
            {
              "id": "8",
              "label": "比较沉静或矜持",
              "trait": "I"
            }
          ]
        },
        {
          "id": "guardianMbti-5",
          "sourceQuestionId": "5",
          "prompt": "一般来说，你和哪些人比较合得来？",
          "options": [
            {
              "id": "9",
              "label": "现实的人",
              "trait": "S"
            },
            {
              "id": "10",
              "label": "富于想象力的人",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-6",
          "sourceQuestionId": "6",
          "prompt": "你是否经常让",
          "options": [
            {
              "id": "11",
              "label": "你的情感支配你的理智",
              "trait": "F"
            },
            {
              "id": "12",
              "label": "你的理智主宰你的情感",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-7",
          "sourceQuestionId": "7",
          "prompt": "处理许多事情上，你会喜欢",
          "options": [
            {
              "id": "13",
              "label": "凭兴所至行事",
              "trait": "P"
            },
            {
              "id": "14",
              "label": "按照计划行事",
              "trait": "J"
            }
          ]
        },
        {
          "id": "guardianMbti-8",
          "sourceQuestionId": "8",
          "prompt": "你是否",
          "options": [
            {
              "id": "15",
              "label": "容易让人了解",
              "trait": "E"
            },
            {
              "id": "16",
              "label": "难于让人了解",
              "trait": "I"
            }
          ]
        },
        {
          "id": "guardianMbti-9",
          "sourceQuestionId": "9",
          "prompt": "按照程序表做事， ",
          "options": [
            {
              "id": "17",
              "label": "合你心意",
              "trait": "J"
            },
            {
              "id": "18",
              "label": "令你感到束缚",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-10",
          "sourceQuestionId": "10",
          "prompt": "当你有一份特别的任务，你会喜欢",
          "options": [
            {
              "id": "19",
              "label": "开始前小心组织计划",
              "trait": "J"
            },
            {
              "id": "20",
              "label": "边做边找须做什么",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-11",
          "sourceQuestionId": "11",
          "prompt": "在大多数情况下，你会选择",
          "options": [
            {
              "id": "21",
              "label": "顺其自然",
              "trait": "P"
            },
            {
              "id": "22",
              "label": "按程序表做事",
              "trait": "J"
            }
          ]
        },
        {
          "id": "guardianMbti-12",
          "sourceQuestionId": "12",
          "prompt": "大多数人会说你是一个",
          "options": [
            {
              "id": "23",
              "label": "重视自我隐私的人",
              "trait": "I"
            },
            {
              "id": "24",
              "label": "非常坦率开放的人",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-13",
          "sourceQuestionId": "13",
          "prompt": "你宁愿被人认为是一个",
          "options": [
            {
              "id": "25",
              "label": "实事求是的人",
              "trait": "S"
            },
            {
              "id": "26",
              "label": "机灵的人",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-14",
          "sourceQuestionId": "14",
          "prompt": "在一大群人当中，通常是",
          "options": [
            {
              "id": "27",
              "label": "你介绍大家认识",
              "trait": "E"
            },
            {
              "id": "28",
              "label": "别人介绍你",
              "trait": "I"
            }
          ]
        },
        {
          "id": "guardianMbti-15",
          "sourceQuestionId": "15",
          "prompt": "你会跟哪些人做朋友？",
          "options": [
            {
              "id": "29",
              "label": "常提出新主意的",
              "trait": "N"
            },
            {
              "id": "30",
              "label": "脚踏实地的",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-16",
          "sourceQuestionId": "16",
          "prompt": "你倾向",
          "options": [
            {
              "id": "31",
              "label": "重视感情多于逻辑",
              "trait": "F"
            },
            {
              "id": "32",
              "label": "重视逻辑多于感情",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-17",
          "sourceQuestionId": "17",
          "prompt": "你比较喜欢",
          "options": [
            {
              "id": "33",
              "label": "坐观事情发展才作计划",
              "trait": "P"
            },
            {
              "id": "34",
              "label": "很早就作计划",
              "trait": "J"
            }
          ]
        },
        {
          "id": "guardianMbti-18",
          "sourceQuestionId": "18",
          "prompt": "你喜欢花很多的时间",
          "options": [
            {
              "id": "35",
              "label": "一个人独处",
              "trait": "I"
            },
            {
              "id": "36",
              "label": "合别人在一起",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-19",
          "sourceQuestionId": "19",
          "prompt": "与很多人一起时会",
          "options": [
            {
              "id": "37",
              "label": "令你活力培增",
              "trait": "E"
            },
            {
              "id": "38",
              "label": "常常令你心力憔悴",
              "trait": "I"
            }
          ]
        },
        {
          "id": "guardianMbti-20",
          "sourceQuestionId": "20",
          "prompt": "你比较喜欢",
          "options": [
            {
              "id": "39",
              "label": "很早便把约会、社交聚集等事情安排妥当",
              "trait": "J"
            },
            {
              "id": "40",
              "label": "无拘无束看当时有什么好玩就做什么",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-21",
          "sourceQuestionId": "21",
          "prompt": "计划一个旅程时，你较喜欢",
          "options": [
            {
              "id": "41",
              "label": "大部分的时间都是跟当天的感觉行事",
              "trait": "P"
            },
            {
              "id": "42",
              "label": "事先知道大部分的日子会做什么",
              "trait": "J"
            }
          ]
        },
        {
          "id": "guardianMbti-22",
          "sourceQuestionId": "22",
          "prompt": "在社交聚会中，你",
          "options": [
            {
              "id": "43",
              "label": "有时感到郁闷",
              "trait": "I"
            },
            {
              "id": "44",
              "label": "常常乐在其中",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-23",
          "sourceQuestionId": "23",
          "prompt": "你通常",
          "options": [
            {
              "id": "45",
              "label": "和别人容易混熟",
              "trait": "E"
            },
            {
              "id": "46",
              "label": "趋向自处一隅",
              "trait": "I"
            }
          ]
        },
        {
          "id": "guardianMbti-24",
          "sourceQuestionId": "24",
          "prompt": "哪些人会更吸引你？ ",
          "options": [
            {
              "id": "47",
              "label": "一个思想敏捷及非常聪颖的人",
              "trait": "N"
            },
            {
              "id": "48",
              "label": "实事求是，具丰富常识的人",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-25",
          "sourceQuestionId": "25",
          "prompt": "在日常工作中，你会",
          "options": [
            {
              "id": "49",
              "label": "颇为喜欢处理迫使你分秒必争的突发",
              "trait": "P"
            },
            {
              "id": "50",
              "label": "通常预先计划，以免要在压力下工作",
              "trait": "J"
            }
          ]
        },
        {
          "id": "guardianMbti-26",
          "sourceQuestionId": "26",
          "prompt": "你认为别人一般",
          "options": [
            {
              "id": "51",
              "label": "要花很长时间才认识你",
              "trait": "I"
            },
            {
              "id": "52",
              "label": "用很短的时间便认识你",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-27",
          "sourceQuestionId": "27",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "53",
              "label": "注重隐私",
              "trait": "I"
            },
            {
              "id": "54",
              "label": "坦率开放",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-28",
          "sourceQuestionId": "28",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "55",
              "label": "预先安排的",
              "trait": "J"
            },
            {
              "id": "56",
              "label": "无计划的",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-29",
          "sourceQuestionId": "29",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "57",
              "label": "抽象",
              "trait": "N"
            },
            {
              "id": "58",
              "label": "具体",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-30",
          "sourceQuestionId": "30",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "59",
              "label": "温柔",
              "trait": "F"
            },
            {
              "id": "60",
              "label": "坚定",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-31",
          "sourceQuestionId": "31",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "61",
              "label": "思考",
              "trait": "T"
            },
            {
              "id": "62",
              "label": "感受",
              "trait": "F"
            }
          ]
        },
        {
          "id": "guardianMbti-32",
          "sourceQuestionId": "32",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "63",
              "label": "事实",
              "trait": "S"
            },
            {
              "id": "64",
              "label": "意念",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-33",
          "sourceQuestionId": "33",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "65",
              "label": "冲动",
              "trait": "P"
            },
            {
              "id": "66",
              "label": "决定",
              "trait": "J"
            }
          ]
        },
        {
          "id": "guardianMbti-34",
          "sourceQuestionId": "34",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "67",
              "label": "热衷",
              "trait": "E"
            },
            {
              "id": "68",
              "label": "文静",
              "trait": "I"
            }
          ]
        },
        {
          "id": "guardianMbti-35",
          "sourceQuestionId": "35",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "69",
              "label": "文静",
              "trait": "I"
            },
            {
              "id": "70",
              "label": "外向",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-36",
          "sourceQuestionId": "36",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "71",
              "label": "有系统",
              "trait": "J"
            },
            {
              "id": "72",
              "label": "随意",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-37",
          "sourceQuestionId": "37",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "73",
              "label": "理论",
              "trait": "N"
            },
            {
              "id": "74",
              "label": "肯定",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-38",
          "sourceQuestionId": "38",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "75",
              "label": "敏感",
              "trait": "F"
            },
            {
              "id": "76",
              "label": "公正",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-39",
          "sourceQuestionId": "39",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "77",
              "label": "令人信服",
              "trait": "T"
            },
            {
              "id": "78",
              "label": "感人的",
              "trait": "F"
            }
          ]
        },
        {
          "id": "guardianMbti-40",
          "sourceQuestionId": "40",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "79",
              "label": "声明",
              "trait": "S"
            },
            {
              "id": "80",
              "label": "概念",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-41",
          "sourceQuestionId": "41",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "81",
              "label": "不受约束",
              "trait": "P"
            },
            {
              "id": "82",
              "label": "预先安排",
              "trait": "J"
            }
          ]
        },
        {
          "id": "guardianMbti-42",
          "sourceQuestionId": "42",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些���语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "83",
              "label": "矜持",
              "trait": "I"
            },
            {
              "id": "84",
              "label": "健谈",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-43",
          "sourceQuestionId": "43",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "85",
              "label": "有条不紊",
              "trait": "J"
            },
            {
              "id": "86",
              "label": "不拘小节",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-44",
          "sourceQuestionId": "44",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "87",
              "label": "意念",
              "trait": "N"
            },
            {
              "id": "88",
              "label": "实况",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-45",
          "sourceQuestionId": "45",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "89",
              "label": "同情怜悯",
              "trait": "F"
            },
            {
              "id": "90",
              "label": "远见",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-46",
          "sourceQuestionId": "46",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "91",
              "label": "利益",
              "trait": "T"
            },
            {
              "id": "92",
              "label": "祝福",
              "trait": "F"
            }
          ]
        },
        {
          "id": "guardianMbti-47",
          "sourceQuestionId": "47",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "93",
              "label": "务实的",
              "trait": "S"
            },
            {
              "id": "94",
              "label": "理论的",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-48",
          "sourceQuestionId": "48",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "95",
              "label": "朋友不多",
              "trait": "I"
            },
            {
              "id": "96",
              "label": "朋友众多",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-49",
          "sourceQuestionId": "49",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "97",
              "label": "有系统",
              "trait": "J"
            },
            {
              "id": "98",
              "label": "即兴",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-50",
          "sourceQuestionId": "50",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "99",
              "label": "富想象的",
              "trait": "N"
            },
            {
              "id": "100",
              "label": "以事论事",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-51",
          "sourceQuestionId": "51",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "101",
              "label": "亲切的",
              "trait": "F"
            },
            {
              "id": "102",
              "label": "客观的",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-52",
          "sourceQuestionId": "52",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "103",
              "label": "客观的",
              "trait": "T"
            },
            {
              "id": "104",
              "label": "热情的",
              "trait": "F"
            }
          ]
        },
        {
          "id": "guardianMbti-53",
          "sourceQuestionId": "53",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "105",
              "label": "建造",
              "trait": "S"
            },
            {
              "id": "106",
              "label": "发明",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-54",
          "sourceQuestionId": "54",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "107",
              "label": "文静",
              "trait": "I"
            },
            {
              "id": "108",
              "label": "爱合群",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-55",
          "sourceQuestionId": "55",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "109",
              "label": "理论",
              "trait": "N"
            },
            {
              "id": "110",
              "label": "事实",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-56",
          "sourceQuestionId": "56",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "111",
              "label": "富同情",
              "trait": "F"
            },
            {
              "id": "112",
              "label": "合逻辑",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-57",
          "sourceQuestionId": "57",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "113",
              "label": "具分析力",
              "trait": "T"
            },
            {
              "id": "114",
              "label": "多愁善感",
              "trait": "F"
            }
          ]
        },
        {
          "id": "guardianMbti-58",
          "sourceQuestionId": "58",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "115",
              "label": "合情合理",
              "trait": "S"
            },
            {
              "id": "116",
              "label": "令人着迷",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-59",
          "sourceQuestionId": "59",
          "prompt": "当你要在一个星期内完成一个大项目，你在开始的时候会",
          "options": [
            {
              "id": "117",
              "label": "把要做的不同工作依次列出",
              "trait": "J"
            },
            {
              "id": "118",
              "label": "马上动工",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-60",
          "sourceQuestionId": "60",
          "prompt": "在社交场合中，你经常会感到",
          "options": [
            {
              "id": "119",
              "label": "与某些人很难打开话匣儿和保持对话",
              "trait": "I"
            },
            {
              "id": "120",
              "label": "与多数人都能从容地长谈",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-61",
          "sourceQuestionId": "61",
          "prompt": "要做许多人也做的事，你比较喜欢",
          "options": [
            {
              "id": "121",
              "label": "按照一般认可的方法去做",
              "trait": "S"
            },
            {
              "id": "122",
              "label": "构想一个自己的想法",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-62",
          "sourceQuestionId": "62",
          "prompt": "你刚认识的朋友能否说出你的兴趣？",
          "options": [
            {
              "id": "123",
              "label": "马上可以",
              "trait": "E"
            },
            {
              "id": "124",
              "label": "要待他们真正了解你之后才可以",
              "trait": "I"
            }
          ]
        },
        {
          "id": "guardianMbti-63",
          "sourceQuestionId": "63",
          "prompt": "你通常较喜欢的科目是",
          "options": [
            {
              "id": "125",
              "label": "讲授概念和原则的",
              "trait": "N"
            },
            {
              "id": "126",
              "label": "讲授事实和数据的",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-64",
          "sourceQuestionId": "64",
          "prompt": "哪个是较高的赞誉，或称许为？",
          "options": [
            {
              "id": "127",
              "label": "一贯感性的人",
              "trait": "F"
            },
            {
              "id": "128",
              "label": "一贯理性的人",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-65",
          "sourceQuestionId": "65",
          "prompt": "你认为按照程序表做事",
          "options": [
            {
              "id": "129",
              "label": "有时是需要的，但一般来说你不大喜欢这样做",
              "trait": "P"
            },
            {
              "id": "130",
              "label": "大多数情况下是有帮助而且是你喜欢做的",
              "trait": "J"
            }
          ]
        },
        {
          "id": "guardianMbti-66",
          "sourceQuestionId": "66",
          "prompt": "和一群人在一起，你通常会选",
          "options": [
            {
              "id": "131",
              "label": "跟你很熟悉的个别人谈话",
              "trait": "I"
            },
            {
              "id": "132",
              "label": "参与大伙的谈话",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-67",
          "sourceQuestionId": "67",
          "prompt": "在社交聚会上，你会",
          "options": [
            {
              "id": "133",
              "label": "是说话很多的一个",
              "trait": "E"
            },
            {
              "id": "134",
              "label": "让别人多说话",
              "trait": "I"
            }
          ]
        },
        {
          "id": "guardianMbti-68",
          "sourceQuestionId": "68",
          "prompt": "把周末期间要完成的事列成清单，这个主意会",
          "options": [
            {
              "id": "135",
              "label": "合你意",
              "trait": "J"
            },
            {
              "id": "136",
              "label": "使你提不起劲",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-69",
          "sourceQuestionId": "69",
          "prompt": "哪个是较高的赞誉，或称许为",
          "options": [
            {
              "id": "137",
              "label": "能干的",
              "trait": "T"
            },
            {
              "id": "138",
              "label": "富有同情心",
              "trait": "F"
            }
          ]
        },
        {
          "id": "guardianMbti-70",
          "sourceQuestionId": "70",
          "prompt": "你通常喜欢",
          "options": [
            {
              "id": "139",
              "label": "事先安排你的社交约会",
              "trait": "J"
            },
            {
              "id": "140",
              "label": "随兴之所至做事",
              "trait": "P"
            }
          ]
        },
        {
          "id": "guardianMbti-71",
          "sourceQuestionId": "71",
          "prompt": "总的说来，要做一个大型作业时，你会选",
          "options": [
            {
              "id": "141",
              "label": "边做边想该做什么",
              "trait": "P"
            },
            {
              "id": "142",
              "label": "首先把工作按步细分",
              "trait": "J"
            }
          ]
        },
        {
          "id": "guardianMbti-72",
          "sourceQuestionId": "72",
          "prompt": "你能否滔滔不绝地与人聊天",
          "options": [
            {
              "id": "143",
              "label": "只限于跟你有共同兴趣的人",
              "trait": "I"
            },
            {
              "id": "144",
              "label": "几乎跟任何人都可以",
              "trait": "E"
            }
          ]
        },
        {
          "id": "guardianMbti-73",
          "sourceQuestionId": "73",
          "prompt": "你会",
          "options": [
            {
              "id": "145",
              "label": "跟随一些证明有效的方法",
              "trait": "S"
            },
            {
              "id": "146",
              "label": "分析还有什么毛病，及针对尚未解决的难题",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-74",
          "sourceQuestionId": "74",
          "prompt": "为乐趣而阅读时，你会",
          "options": [
            {
              "id": "147",
              "label": "喜欢奇特或创新的表达方式",
              "trait": "N"
            },
            {
              "id": "148",
              "label": "喜欢作者直话直说",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-75",
          "sourceQuestionId": "75",
          "prompt": "你宁愿替哪一类上司（或者老师）工作？",
          "options": [
            {
              "id": "149",
              "label": "性淳良，但常常前后不一的",
              "trait": "F"
            },
            {
              "id": "150",
              "label": "词尖锐但永远合乎逻辑的",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-76",
          "sourceQuestionId": "76",
          "prompt": "你做事多数是",
          "options": [
            {
              "id": "151",
              "label": "当天心情去做",
              "trait": "P"
            },
            {
              "id": "152",
              "label": "拟好的程序表去做",
              "trait": "J"
            }
          ]
        },
        {
          "id": "guardianMbti-77",
          "sourceQuestionId": "77",
          "prompt": "你是否",
          "options": [
            {
              "id": "153",
              "label": "以和任何人按需求从容地交谈，或是",
              "trait": "E"
            },
            {
              "id": "154",
              "label": "是对某些人或在某种情况下才可以畅所欲言",
              "trait": "I"
            }
          ]
        },
        {
          "id": "guardianMbti-78",
          "sourceQuestionId": "78",
          "prompt": "要作决定时，你认为比较重要的是",
          "options": [
            {
              "id": "155",
              "label": "事实衡量",
              "trait": "T"
            },
            {
              "id": "156",
              "label": "虑他人的感受和意见",
              "trait": "F"
            }
          ]
        },
        {
          "id": "guardianMbti-79",
          "sourceQuestionId": "79",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "157",
              "label": "想象的",
              "trait": "N"
            },
            {
              "id": "158",
              "label": "真实的",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-80",
          "sourceQuestionId": "80",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "159",
              "label": "仁慈慷慨的",
              "trait": "F"
            },
            {
              "id": "160",
              "label": "意志坚定的",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-81",
          "sourceQuestionId": "81",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "161",
              "label": "公正的",
              "trait": "T"
            },
            {
              "id": "162",
              "label": "有关怀心",
              "trait": "F"
            }
          ]
        },
        {
          "id": "guardianMbti-82",
          "sourceQuestionId": "82",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "163",
              "label": "制作",
              "trait": "S"
            },
            {
              "id": "164",
              "label": "设计",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-83",
          "sourceQuestionId": "83",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "165",
              "label": "可能性",
              "trait": "N"
            },
            {
              "id": "166",
              "label": "必然性",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-84",
          "sourceQuestionId": "84",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "167",
              "label": "温柔",
              "trait": "F"
            },
            {
              "id": "168",
              "label": "力量",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-85",
          "sourceQuestionId": "85",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "169",
              "label": "实际",
              "trait": "T"
            },
            {
              "id": "170",
              "label": "多愁善感",
              "trait": "F"
            }
          ]
        },
        {
          "id": "guardianMbti-86",
          "sourceQuestionId": "86",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "171",
              "label": "制造",
              "trait": "S"
            },
            {
              "id": "172",
              "label": "创造",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-87",
          "sourceQuestionId": "87",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "173",
              "label": "新颖的",
              "trait": "N"
            },
            {
              "id": "174",
              "label": "已知的",
              "trait": "S"
            }
          ]
        },
        {
          "id": "guardianMbti-88",
          "sourceQuestionId": "88",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "175",
              "label": "同情",
              "trait": "F"
            },
            {
              "id": "176",
              "label": "分析",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-89",
          "sourceQuestionId": "89",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "177",
              "label": "坚持己见",
              "trait": "T"
            },
            {
              "id": "178",
              "label": "温柔有爱心",
              "trait": "F"
            }
          ]
        },
        {
          "id": "guardianMbti-90",
          "sourceQuestionId": "90",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "179",
              "label": "具体的",
              "trait": "S"
            },
            {
              "id": "180",
              "label": "抽象的",
              "trait": "N"
            }
          ]
        },
        {
          "id": "guardianMbti-91",
          "sourceQuestionId": "91",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "181",
              "label": "全心投入",
              "trait": "F"
            },
            {
              "id": "182",
              "label": "有决心的",
              "trait": "T"
            }
          ]
        },
        {
          "id": "guardianMbti-92",
          "sourceQuestionId": "92",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "183",
              "label": "能干",
              "trait": "T"
            },
            {
              "id": "184",
              "label": "仁慈",
              "trait": "F"
            }
          ]
        },
        {
          "id": "guardianMbti-93",
          "sourceQuestionId": "93",
          "prompt": "以下哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音",
          "options": [
            {
              "id": "185",
              "label": "实际",
              "trait": "S"
            },
            {
              "id": "186",
              "label": "创新",
              "trait": "N"
            }
          ]
        }
      ]
    }
  ]
} as const;
