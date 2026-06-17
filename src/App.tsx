import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GuardianResultReport } from "./components/GuardianResultReport";
import { SURVEY_CATALOG } from "./questionBank";
import {
  adminLogin,
  createRecord,
  deleteAdminRecord,
  downloadAdminCsv,
  downloadAdminRecordJson,
  getAdminRecord,
  getPublicRecord,
  listAdminRecords,
  notifyCompletion,
  saveProfile,
  saveSurveySection,
} from "./lib/api";
import { calculateGuardianMbti } from "./lib/guardianMbti";
import type {
  AdminDetail,
  AdminListItem,
  AnswerMap,
  PublicRecord,
  StudentProfile,
  SurveyDefinition,
  SurveyKey,
} from "./types";

const tokenStorageKey = "ai-tifen-admin-token";
const publicRecordStorageKey = "mca-learning-assessment-access-code";

const blankProfile = (): StudentProfile => ({
  studentName: "",
  schoolName: "",
  grade: "",
  gender: "",
  guardianName: "",
  guardianRole: "",
  subjectScores: {
    chinese: "",
    math: "",
    english: "",
    physics: "",
    chemistry: "",
    biology: "",
    politics: "",
    history: "",
    geography: "",
  },
  scoreNotes: "",
});

const studentSurveyKeys: SurveyKey[] = [
  "studentMbti",
  "learningMotivation",
  "vark",
  "cognition",
];
const isStudentSurveyKey = (surveyKey: SurveyKey) => studentSurveyKeys.includes(surveyKey);

const devMode = import.meta.env.DEV;
type PublicRole = "student" | "guardian";

function App() {
  const isAdminRoute = window.location.pathname.startsWith("/admin");
  return isAdminRoute ? <AdminApp /> : <PublicApp />;
}

function PublicApp() {
  const surveys = SURVEY_CATALOG.surveys;
  const isGuardianUrl =
    window.location.pathname === "/guardian" ||
    window.location.pathname.startsWith("/guardian/") ||
    window.location.search.includes("role=guardian");

  const [record, setRecord] = useState<PublicRecord | null>(null);
  const [roleMode, setRoleMode] = useState<PublicRole | null>(isGuardianUrl ? "guardian" : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileDraft, setProfileDraft] = useState<StudentProfile>(blankProfile());
  const [profileCollapsed, setProfileCollapsed] = useState(false);
  const [activeSurveyKey, setActiveSurveyKey] = useState<SurveyKey | null>(isGuardianUrl ? "guardianMbti" : null);
  const [surveyDraft, setSurveyDraft] = useState<AnswerMap>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [noticeStatus, setNoticeStatus] = useState("");
  const [flowHint, setFlowHint] = useState("");
  const [showGuardianReport, setShowGuardianReport] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showMcaInfoModal, setShowMcaInfoModal] = useState(false);
  const debounceTimer = useRef<number | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const flowHintTimer = useRef<number | null>(null);
  const draftHydrated = useRef(isGuardianUrl);
  const allowBrowserBack = useRef(false);

  const activeSurvey = useMemo(
    () => surveys.find((survey) => survey.key === activeSurveyKey) ?? null,
    [activeSurveyKey, surveys],
  );

  useEffect(() => {
    if (isGuardianUrl || record) {
      return;
    }
    const accessCode = localStorage.getItem(publicRecordStorageKey);
    if (!accessCode) {
      return;
    }

    let cancelled = false;
    void getPublicRecord(accessCode)
      .then((response) => {
        if (cancelled) {
          return;
        }
        setRecord(response.record);
        setRoleMode("student");
        setProfileDraft(response.record.profile);
        setProfileCollapsed(response.record.completion.profile);
        setLastSavedAt(formatTime(response.record.updatedAt));
      })
      .catch(() => {
        localStorage.removeItem(publicRecordStorageKey);
      });

    return () => {
      cancelled = true;
    };
  }, [isGuardianUrl, record]);

  const hasStarted = Boolean(record) || roleMode === "guardian";

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    window.history.pushState({ mcaSurveyGuard: true }, "", window.location.href);

    const handlePopState = () => {
      if (allowBrowserBack.current) {
        return;
      }
      if (window.confirm("测评进度已自动保存，确定要离开当前测评吗？")) {
        allowBrowserBack.current = true;
        window.history.back();
        return;
      }
      window.history.pushState({ mcaSurveyGuard: true }, "", window.location.href);
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!showMcaInfoModal) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMcaInfoModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMcaInfoModal]);

  useEffect(() => {
    if (!record || !activeSurvey || !draftHydrated.current) {
      draftHydrated.current = true;
      return;
    }
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = window.setTimeout(async () => {
      try {
        const response = await saveSurveySection(
          record.accessCode,
          activeSurvey.key,
          surveyDraft,
          record.sections[activeSurvey.key].completed,
        );
        setRecord(response.record);
        localStorage.setItem(publicRecordStorageKey, response.record.accessCode);
        setLastSavedAt(formatTime(response.record.updatedAt));
      } catch {
        setError("自动保存失败，请稍后重试。");
      }
    }, 600);

    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, [activeSurvey, record, surveyDraft]);

  const handleStart = async (role: PublicRole) => {
    if (role === "guardian") {
      setRoleMode("guardian");
      setRecord(null);
      setSurveyDraft({});
      setQuestionIndex(0);
      setShowGuardianReport(false);
      setError("");
      draftHydrated.current = true;
      setActiveSurveyKey("guardianMbti");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await createRecord();
      setRecord(response.record);
      localStorage.setItem(publicRecordStorageKey, response.record.accessCode);
      setRoleMode(role);
      setProfileDraft(response.record.profile);
      setProfileCollapsed(false);
      setShowGuardianReport(false);
    } catch (requestError) {
      setError(getMessage(requestError, "进入测评失败，请刷新后重试"));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!record) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await saveProfile(record.accessCode, profileDraft);
      setRecord(response.record);
      localStorage.setItem(publicRecordStorageKey, response.record.accessCode);
      setProfileDraft(response.record.profile);
      setProfileCollapsed(response.record.completion.profile);
      setLastSavedAt(formatTime(response.record.updatedAt));
    } catch (requestError) {
      setError(getMessage(requestError, "保存档案失败"));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setSurveyDraft((current) => ({
      ...current,
      [questionId]: optionId,
    }));

    if (!activeSurvey) {
      return;
    }

    if (questionIndex < activeSurvey.questions.length - 1) {
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
      transitionTimer.current = window.setTimeout(() => {
        setQuestionIndex((current) => current + 1);
        transitionTimer.current = null;
      }, 200);
      return;
    }

    showFlowHint("最后一题已选择，请点击下方提交完成本项测评。");
  };

  useEffect(() => {
    return () => {
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, [activeSurveyKey, questionIndex]);

  useEffect(() => {
    return () => {
      if (flowHintTimer.current) {
        window.clearTimeout(flowHintTimer.current);
      }
    };
  }, []);

  const showFlowHint = (message: string) => {
    setFlowHint(message);
    if (flowHintTimer.current) {
      window.clearTimeout(flowHintTimer.current);
    }
    flowHintTimer.current = window.setTimeout(() => {
      setFlowHint("");
      flowHintTimer.current = null;
    }, 2800);
  };

  const getSurveyLockMessage = (surveyKey: SurveyKey) => {
    if (!record || !isStudentSurveyKey(surveyKey) || record.completion[surveyKey]) {
      return "";
    }
    if (!record.completion.profile) {
      return "请先保存基础档案，再开始测评。";
    }

    const surveyIndex = studentSurveyKeys.indexOf(surveyKey);
    const previousSurveyKey = studentSurveyKeys
      .slice(0, surveyIndex)
      .find((key) => !record.completion[key]);
    if (!previousSurveyKey) {
      return "";
    }

    const previousSurvey = surveys.find((item) => item.key === previousSurveyKey);
    const currentSurvey = surveys.find((item) => item.key === surveyKey);
    return `请先完成${previousSurvey?.shortTitle ?? "上一项测评"}，再进入${currentSurvey?.shortTitle ?? "下一项测评"}。`;
  };

  const handleOpenSurvey = (surveyKey: SurveyKey) => {
    if (!record) {
      return;
    }
    const survey = surveys.find((item) => item.key === surveyKey);
    if (!survey) {
      return;
    }
    const lockMessage = getSurveyLockMessage(surveyKey);
    if (lockMessage) {
      showFlowHint(lockMessage);
      return;
    }
    const section = record.sections[surveyKey];
    draftHydrated.current = false;
    setSurveyDraft(section.answers);
    setQuestionIndex(
      Math.min(
        section.completed
          ? survey.questions.length - 1
          : firstIncompleteIndex(survey, section.answers),
        survey.questions.length - 1,
      ),
    );
    setShowGuardianReport(false);
    setActiveSurveyKey(surveyKey);
  };

  const handleSurveyBack = () => {
    if (roleMode === "guardian" && !record) {
      setRoleMode("guardian");
      setActiveSurveyKey("guardianMbti");
      setSurveyDraft({});
      setQuestionIndex(0);
      return;
    }
    setActiveSurveyKey(null);
  };

  const handleCompleteSurvey = async () => {
    if (!activeSurvey) {
      return;
    }
    const allAnswered = activeSurvey.questions.every((question) => Boolean(surveyDraft[question.id]));
    if (!allAnswered) {
      setError("还有题目未填写，先完成再提交。");
      return;
    }

    if (roleMode === "guardian" && !record && activeSurvey.key === "guardianMbti") {
      setActiveSurveyKey(null);
      setShowGuardianReport(true);
      return;
    }

    if (!record) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const wasCompleted = studentSurveyKeys.every((key) => record.completion[key]);
      const response = await saveSurveySection(
        record.accessCode,
        activeSurvey.key,
        surveyDraft,
        true,
      );
      const isCompletedNow = studentSurveyKeys.every((key) => response.record.completion[key]);

      setRecord(response.record);
      localStorage.setItem(publicRecordStorageKey, response.record.accessCode);
      setActiveSurveyKey(null);
      setShowGuardianReport(activeSurvey.key === "guardianMbti");
      setLastSavedAt(formatTime(response.record.updatedAt));

      if (!wasCompleted && isCompletedNow && roleMode === "student") {
        await sendCompletionNotice(response.record.accessCode, "completed");
        setShowCompletionModal(true);
      }
    } catch (requestError) {
      setError(getMessage(requestError, "提交测评失败"));
    } finally {
      setLoading(false);
    }
  };

  const sendCompletionNotice = async (accessCode: string, reason: string) => {
    setNoticeStatus("");
    try {
      await notifyCompletion(accessCode, reason);
      setNoticeStatus("已通知老师查看测评结果。");
    } catch (requestError) {
      setNoticeStatus(getMessage(requestError, "通知邮件发送失败，请稍后在后台确认记录。"));
    }
  };

  const activeQuestion =
    activeSurvey?.questions[questionIndex] ?? null;

  const guardianSurvey = surveys.find((survey) => survey.key === "guardianMbti");
  const guardianResult =
    guardianSurvey
      ? calculateGuardianMbti(
          guardianSurvey,
          roleMode === "guardian" && !record ? surveyDraft : record?.sections.guardianMbti.answers ?? {},
        )
      : null;
  const completedStudentSurveyCount = record
    ? studentSurveyKeys.filter((key) => record.completion[key]).length
    : 0;
  const nextStudentSurveyKey =
    record && roleMode !== "guardian"
      ? studentSurveyKeys.find((key) => !record.completion[key]) ?? null
      : null;
  const nextStudentSurvey = nextStudentSurveyKey
    ? surveys.find((survey) => survey.key === nextStudentSurveyKey) ?? null
    : null;
  const studentSurveysCompleted = completedStudentSurveyCount === studentSurveyKeys.length;
  const studentFlowSurveys = surveys.filter((survey) => isStudentSurveyKey(survey.key));
  const nextStudentSurveyLockMessage = nextStudentSurvey
    ? getSurveyLockMessage(nextStudentSurvey.key)
    : "";

  const fillProfileSample = () => {
    setProfileDraft({
      studentName: "测试学生",
      schoolName: "示例实验学校",
      grade: "初二",
      gender: "男",
      guardianName: "测试家长",
      guardianRole: "妈妈",
      subjectScores: {
        chinese: "104",
        math: "118",
        english: "109",
        physics: "92",
        chemistry: "88",
        biology: "A",
        politics: "A",
        history: "A",
        geography: "A",
      },
      scoreNotes: "开发环境样例数据，用于快速回归。",
    });
  };

  const fillCurrentSurveySample = () => {
    if (!activeSurvey) {
      return;
    }
    const sampleAnswers = Object.fromEntries(
      activeSurvey.questions.map((question) => [question.id, question.options[0]?.id ?? ""]),
    );
    setSurveyDraft(sampleAnswers);
  };

  const fillAllSurveysForDev = async () => {
    if (!record || !devMode) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const seededProfile = {
        studentName: "测试学生",
        schoolName: "示例实验学校",
        grade: "初二",
        gender: "男",
        guardianName: "测试家长",
        guardianRole: "妈妈",
        subjectScores: {
          chinese: "104",
          math: "118",
          english: "109",
          physics: "92",
          chemistry: "88",
          biology: "A",
          politics: "A",
          history: "A",
          geography: "A",
        },
        scoreNotes: "开发环境一键填充完整记录。",
      } satisfies StudentProfile;

      let nextRecord = (await saveProfile(record.accessCode, seededProfile)).record;

      for (const survey of surveys) {
        const answers = Object.fromEntries(
          survey.questions.map((question) => [question.id, question.options[0]?.id ?? ""]),
        );
        nextRecord = (
          await saveSurveySection(nextRecord.accessCode, survey.key, answers, true)
        ).record;
      }

      setRecord(nextRecord);
      setProfileDraft(nextRecord.profile);
      setLastSavedAt(formatTime(nextRecord.updatedAt));
      if (roleMode === "student") {
        setShowCompletionModal(true);
      }
    } catch (requestError) {
      setError(getMessage(requestError, "开发环境快速填充失败"));
    } finally {
      setLoading(false);
    }
  };

  const fillAllSurveysAndNotifyForDev = async () => {
    if (!record || !devMode) {
      return;
    }
    await fillAllSurveysForDev();
    await sendCompletionNotice(record.accessCode, "dev-test");
  };

  return (
    <div className="page-shell">
      <header className={hasStarted ? "hero-strip compact" : "hero-strip"}>
        <div>
          <p className="eyebrow">AI 提分叶路春</p>
          <div className="hero-title-row">
            <h1>MCA学习力测评</h1>
            <McaInfoButton onClick={() => setShowMcaInfoModal(true)} />
          </div>
          {!hasStarted ? (
            <p className="hero-copy">测评，是你认识自己的开始。没有测评，就没有洞察。</p>
          ) : null}
        </div>
        {hasStarted ? (
          <div className="access-card">
            <span>当前测评</span>
            <strong>{roleMode === "guardian" ? "独立测评" : "学习力测评"}</strong>
          </div>
        ) : (
          <div className="access-card subtle">
            <span>预计用时</span>
            <strong>15-20 分钟</strong>
            <small>自动保存进度，可分段完成</small>
          </div>
        )}
      </header>

      {error ? <div className="toast error">{error}</div> : null}
      {lastSavedAt ? <div className="toast success">最近保存：{lastSavedAt}</div> : null}
      {flowHint ? <div className="toast info">{flowHint}</div> : null}
      {noticeStatus ? <div className="toast info">{noticeStatus}</div> : null}

      {!hasStarted ? (
        <section className="board board-home">
          <div className="home-entry">
            <article className="home-primary">
              <p className="eyebrow">学习力测评</p>
              <h2>完成档案与 4 项测评，生成学习画像。</h2>
              <div className="home-actions">
                <button type="button" className="primary" onClick={() => handleStart("student")} disabled={loading}>
                  {loading ? "正在进入..." : "开始测评"}
                </button>
                <span>无需登录</span>
              </div>
            </article>
            <aside className="home-brief" aria-label="测评内容">
              <div>
                <span>01</span>
                <strong>基础档案</strong>
                <small>学校、年级与近期成绩</small>
              </div>
              <div>
                <span>02</span>
                <strong>学习偏好</strong>
                <small>性格、风格、动力与认知</small>
              </div>
              <div>
                <span>03</span>
                <strong>进度保存</strong>
                <small>中途离开后可继续填写</small>
              </div>
            </aside>
          </div>
        </section>
      ) : null}

      {hasStarted ? (
        <section className="board">
          {activeSurvey ? (
            <div className="survey-shell">
              <div className="survey-topbar">
                {roleMode === "guardian" && !record ? (
                  <button type="button" className="ghost" onClick={handleSurveyBack}>
                    重新开始
                  </button>
                ) : (
                  <button type="button" className="ghost" onClick={handleSurveyBack}>
                    返回总览
                  </button>
                )}
                <div className="survey-meta">
                  <span>{activeSurvey.shortTitle}</span>
                  <strong>
                    {questionIndex + 1} / {activeSurvey.questions.length}
                  </strong>
                </div>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((questionIndex + 1) / activeSurvey.questions.length) * 100}%`,
                  }}
                />
              </div>
              <div className="survey-stage">
                <aside className="survey-aside">
                  <p className="eyebrow">当前部分</p>
                  <h2>{activeSurvey.title}</h2>
                  <p>{activeSurvey.intro}</p>
                  {devMode ? (
                    <button type="button" className="secondary" onClick={fillCurrentSurveySample}>
                      开发环境：本页一键填充
                    </button>
                  ) : null}
                </aside>
                {activeQuestion ? (
                  <div className="question-panel">
                    <p className="question-count">第 {questionIndex + 1} 题</p>
                    <h3>{activeQuestion.prompt}</h3>
                    <div className="option-grid">
                      {activeQuestion.options.map((option) => {
                        const selected = surveyDraft[activeQuestion.id] === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            className={selected ? "option-card selected" : "option-card"}
                            onClick={() => handleAnswer(activeQuestion.id, option.id)}
                          >
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="survey-actions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setQuestionIndex((current) => Math.max(current - 1, 0))}
                        disabled={questionIndex === 0}
                      >
                        上一题
                      </button>
                      {questionIndex < activeSurvey.questions.length - 1 ? (
                        <button
                          type="button"
                          className="primary"
                          onClick={() =>
                            setQuestionIndex((current) =>
                              Math.min(current + 1, activeSurvey.questions.length - 1),
                            )
                          }
                          disabled={!surveyDraft[activeQuestion.id]}
                        >
                          下一题
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="primary"
                          onClick={handleCompleteSurvey}
                          disabled={loading || !surveyDraft[activeQuestion.id]}
                        >
                          {roleMode === "guardian" && !record ? "提交并查看结果" : "提交"}
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={roleMode === "guardian" ? "dashboard" : "dashboard student-flow"}>
              {showGuardianReport && guardianResult ? (
                <div className="dashboard-column wide">
                  <GuardianResultReport
                    result={guardianResult}
                    guardianName={record?.profile.guardianName}
                    onBack={roleMode === "guardian" ? undefined : () => setShowGuardianReport(false)}
                  />
                </div>
              ) : record ? (
              <div className="dashboard-column wide">
                {roleMode !== "guardian" ? (
                  <section className="stack-card flow-card">
                    <p className="eyebrow">流程</p>
                    <div className="section-heading">
                      <div>
                        <h2>档案 + 4 项测评</h2>
                      </div>
                      {nextStudentSurvey ? (
                        <button
                          type="button"
                          className={nextStudentSurveyLockMessage ? "primary action-locked" : "primary"}
                          onClick={() => handleOpenSurvey(nextStudentSurvey.key)}
                          aria-disabled={Boolean(nextStudentSurveyLockMessage)}
                          title={nextStudentSurveyLockMessage || undefined}
                        >
                          继续：{nextStudentSurvey.shortTitle}
                        </button>
                      ) : null}
                    </div>
                    <div className="flow-steps">
                      <div className={record.completion.profile ? "flow-step done" : "flow-step current"}>
                        <span>1</span>
                        <div>
                          <strong>基础档案</strong>
                          <small>{record.completion.profile ? "已保存" : "待保存"}</small>
                        </div>
                      </div>
                      {studentFlowSurveys.map((survey, index) => {
                        const lockMessage = getSurveyLockMessage(survey.key);
                        const answeredCount = countAnswered(survey, record.sections[survey.key].answers);
                        return (
                          <button
                            key={survey.key}
                            type="button"
                            className={[
                              "flow-step",
                              record.completion[survey.key] ? "done" : "",
                              lockMessage ? "locked" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() => handleOpenSurvey(survey.key)}
                            aria-disabled={Boolean(lockMessage)}
                            title={lockMessage || undefined}
                          >
                            <span>{index + 2}</span>
                            <div>
                              <strong>{survey.shortTitle}</strong>
                              <small>
                                {record.completion[survey.key]
                                  ? "已提交"
                                  : lockMessage
                                    ? "待前一步完成"
                                    : `${answeredCount}/${survey.questions.length}`}
                              </small>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {studentSurveysCompleted ? (
                      <p className="completion-note">已完成</p>
                    ) : null}
                  </section>
                ) : null}

                <section className="stack-card">
                  <p className="eyebrow">档案信息</p>
                  <div className="section-heading">
                      <div>
                        <h2>基础档案</h2>
                        <p>填写身份信息与近期成绩。</p>
                      </div>
                    <div className="button-row">
                      {record.completion.profile ? (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => setProfileCollapsed((current) => !current)}
                        >
                          {profileCollapsed ? "展开编辑" : "收起档案"}
                        </button>
                      ) : null}
                      {devMode ? (
                        <button type="button" className="ghost" onClick={fillProfileSample}>
                          开发环境：填入样例
                        </button>
                      ) : null}
                      <button type="button" className="secondary" onClick={handleProfileSave} disabled={loading}>
                        {loading ? "保存中..." : "保存档案"}
                      </button>
                    </div>
                  </div>
                  {profileCollapsed ? (
                    <div className="profile-summary">
                      <p>
                        {profileDraft.studentName || "未填写姓名"} / {profileDraft.schoolName || "未填写学校"}
                      </p>
                      <p>
                        {profileDraft.grade || "未填写年级"} / {profileDraft.gender || "未填写性别"}
                      </p>
                      <p>
                        {SURVEY_CATALOG.profile.subjectFields
                          .map((field) => {
                            const value = profileDraft.subjectScores[field.key];
                            return value ? `${field.label} ${value}` : "";
                          })
                          .filter(Boolean)
                          .join("，") || "未填写学科成绩"}
                      </p>
                      {profileDraft.scoreNotes ? <p>{profileDraft.scoreNotes}</p> : null}
                    </div>
                  ) : (
                    <>
                      <div className="profile-grid">
                        <label className="field">
                          <span>学生姓名</span>
                          <input
                            value={profileDraft.studentName}
                            onChange={(event) =>
                              setProfileDraft((current) => ({
                                ...current,
                                studentName: event.target.value,
                              }))
                            }
                          />
                        </label>
                        <label className="field">
                          <span>学校全称</span>
                          <input
                            value={profileDraft.schoolName}
                            onChange={(event) =>
                              setProfileDraft((current) => ({
                                ...current,
                                schoolName: event.target.value,
                              }))
                            }
                          />
                        </label>
                        <label className="field">
                          <span>年级</span>
                          <select
                            value={profileDraft.grade}
                            onChange={(event) =>
                              setProfileDraft((current) => ({
                                ...current,
                                grade: event.target.value,
                              }))
                            }
                          >
                            <option value="">请选择</option>
                            {SURVEY_CATALOG.profile.gradeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field">
                          <span>性别</span>
                          <select
                            value={profileDraft.gender}
                            onChange={(event) =>
                              setProfileDraft((current) => ({
                                ...current,
                                gender: event.target.value,
                              }))
                            }
                          >
                            <option value="">请选择</option>
                            {SURVEY_CATALOG.profile.genderOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="score-grid">
                        {SURVEY_CATALOG.profile.subjectFields.map((field) => (
                          <label className="field score-field" key={field.key}>
                            <span>{field.label}</span>
                            <input
                              value={profileDraft.subjectScores[field.key]}
                              onChange={(event) =>
                                setProfileDraft((current) => ({
                                  ...current,
                                  subjectScores: {
                                    ...current.subjectScores,
                                    [field.key]: event.target.value,
                                  },
                                }))
                              }
                              placeholder="如99/满分"
                            />
                          </label>
                        ))}
                      </div>
                      <label className="field">
                        <span>成绩备注</span>
                        <textarea
                          value={profileDraft.scoreNotes}
                          onChange={(event) =>
                            setProfileDraft((current) => ({
                              ...current,
                              scoreNotes: event.target.value,
                            }))
                          }
                          placeholder="例如：总分、偏科情况、最近一次大考表现、目标学校等"
                        />
                      </label>
                    </>
                  )}
                </section>

                {devMode ? (
                  <section className="stack-card">
                    <p className="eyebrow">开发环境</p>
                    <div className="section-heading">
                      <div>
                        <h2>测试加速</h2>
                        <p>快速造一条完整样例记录，直接验证后台、导出、完成态和邮件通知。</p>
                      </div>
                      <div className="button-row">
                        <button type="button" className="ghost" onClick={fillAllSurveysForDev} disabled={loading}>
                          一键填完整套
                        </button>
                        <button type="button" className="secondary" onClick={fillAllSurveysAndNotifyForDev} disabled={loading}>
                          跳过问卷并发送测试通知
                        </button>
                      </div>
                    </div>
                  </section>
                ) : null}

              </div>
              ) : null}

              {record && roleMode === "guardian" ? (
              <div className="dashboard-column">
                {roleMode === "guardian" ? (
                  <section className="stack-card">
                    <p className="eyebrow">家长任务</p>
                    <h2>家长 MBTI 结果</h2>
                    {guardianSurvey ? (
                      <SurveyCard
                        survey={guardianSurvey}
                        completed={record.completion.guardianMbti}
                        answeredCount={countAnswered(
                          guardianSurvey,
                          record.sections.guardianMbti.answers,
                        )}
                        onOpen={() => handleOpenSurvey("guardianMbti")}
                      />
                    ) : null}
                    {guardianResult ? (
                      <div className="mini-result">
                        <span>当前 MBTI</span>
                        <strong>{guardianResult.typeCode}</strong>
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => setShowGuardianReport(true)}
                        >
                          查看结果页
                        </button>
                      </div>
                    ) : null}
                  </section>
                ) : null}

              </div>
              ) : null}
            </div>
          )}
        </section>
      ) : null}
      <SiteFooter />
      {showMcaInfoModal ? (
        <McaInfoModal onClose={() => setShowMcaInfoModal(false)} />
      ) : null}
      {showCompletionModal ? (
        <div className="modal-overlay" onClick={() => setShowCompletionModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✓</div>
            <h2 className="modal-title">你已做完</h2>
            <p className="modal-body">请告知家长</p>
            <button
              type="button"
              className="primary modal-btn"
              onClick={() => setShowCompletionModal(false)}
            >
              我知道了
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function McaInfoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="info-button"
      onClick={onClick}
      aria-label="了解 MCA"
      title="了解 MCA"
    >
      ?
    </button>
  );
}

function McaInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay mca-info-overlay" onClick={onClose}>
      <div
        className="modal-container mca-info-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mca-info-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-button"
          onClick={onClose}
          aria-label="关闭 MCA 说明"
          title="关闭"
        >
          ×
        </button>
        <div className="modal-icon info">?</div>
        <h2 id="mca-info-title" className="modal-title">为什么要做 MCA 学习力测评？</h2>
        <div className="mca-info-content">
          <section>
            <h3>MCA 是什么</h3>
            <p>MCA 是一套从性格倾向、学习动力、学习风格、认知方式四个角度理解学生学习状态的测评。它不是给孩子贴标签，而是帮助老师和家长看见孩子真实的学习模式。</p>
          </section>
          <section>
            <h3>它解决什么问题</h3>
            <p>很多学习问题表面看是成绩，背后可能是动力不足、接收信息方式不匹配、表达和决策习惯不同。MCA 先给出一张学习画像，让后续沟通少一点猜测，多一点依据。</p>
          </section>
          <section>
            <h3>测完有什么用</h3>
            <p>老师可以基于结果做更具体的沟通和提分建议；家长也能更容易理解孩子适合怎样被引导。测评不是结论，是一次更准确的开始。</p>
          </section>
        </div>
        <button type="button" className="primary modal-btn" onClick={onClose}>
          知道了
        </button>
      </div>
    </div>
  );
}

function SiteFooter() {
  return <footer className="site-footer">Powered by AI 提分叶路春</footer>;
}

function SurveyCard({
  survey,
  completed,
  answeredCount,
  onOpen,
}: {
  survey: SurveyDefinition;
  completed: boolean;
  answeredCount: number;
  onOpen: () => void;
}) {
  return (
    <article className={completed ? "survey-card done" : "survey-card"}>
      <div>
        <p className="card-kicker">{survey.audience === "guardian" ? "家长" : "学生"}</p>
        <h3>{survey.shortTitle}</h3>
        <p>{survey.intro}</p>
      </div>
      <div className="survey-card-footer">
        <span>
          {answeredCount}/{survey.questions.length}
        </span>
        <button type="button" className="secondary" onClick={onOpen}>
          {completed ? "查看/修改" : "开始填写"}
        </button>
      </div>
    </article>
  );
}

function AdminApp() {
  const [token, setToken] = useState<string>(() => sessionStorage.getItem(tokenStorageKey) ?? "");
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<AdminListItem[]>([]);
  const [selected, setSelected] = useState<AdminDetail | null>(null);
  const [selectedSurveyKey, setSelectedSurveyKey] = useState<SurveyKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const deepLinkedRecordId = useMemo(
    () => new URLSearchParams(window.location.search).get("record"),
    [],
  );

  const refreshList = async (currentToken: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await listAdminRecords(currentToken);
      setRecords(response.records);
    } catch (requestError) {
      setError(getMessage(requestError, "读取后台数据失败"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const timeout = window.setTimeout(() => {
        void refreshList(token);
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [token]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminLogin(password);
      sessionStorage.setItem(tokenStorageKey, response.token);
      setToken(response.token);
      setPassword("");
    } catch (requestError) {
      setError(getMessage(requestError, "登录失败"));
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback(async (id: string) => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await getAdminRecord(id, token);
      setSelected(response.record);
      setSelectedSurveyKey((current) => current ?? firstAnsweredSurveyKey(response.record));
    } catch (requestError) {
      setError(getMessage(requestError, "读取详情失败"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !deepLinkedRecordId || selected?.id === deepLinkedRecordId) {
      return;
    }
    if (!records.some((recordItem) => recordItem.id === deepLinkedRecordId)) {
      return;
    }
    const timeout = window.setTimeout(() => {
      void handleSelect(deepLinkedRecordId);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [deepLinkedRecordId, handleSelect, records, selected?.id, token]);

  const handleExport = async () => {
    if (!token) {
      return;
    }
    try {
      const blob = await downloadAdminCsv(token);
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = "assessment-records.csv";
      anchor.click();
      URL.revokeObjectURL(href);
    } catch (requestError) {
      setError(getMessage(requestError, "导出失败"));
    }
  };

  const handleExportSelected = async () => {
    if (!token || !selected) {
      return;
    }
    try {
      const blob = await downloadAdminRecordJson(selected.id, token);
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `${selected.profile.studentName || selected.accessCode}-assessment.json`;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch (requestError) {
      setError(getMessage(requestError, "导出失败"));
    }
  };

  const handleExportSelectedCsvs = () => {
    if (!selected) {
      return;
    }
    try {
      const zip = new SimpleZip();
      const studentName = selected.profile.studentName || selected.accessCode;

      // 1. 基础档案
      const profileHeaders = [
        "学生姓名",
        "学校全称",
        "年级",
        "性别",
        "家长姓名",
        "家长身份",
        "语文",
        "数学",
        "英语",
        "物理",
        "化学",
        "生物",
        "政治",
        "历史",
        "地理",
        "成绩备注",
      ];
      const profileValues = [
        selected.profile.studentName,
        selected.profile.schoolName,
        selected.profile.grade,
        selected.profile.gender,
        selected.profile.guardianName,
        selected.profile.guardianRole,
        selected.profile.subjectScores.chinese,
        selected.profile.subjectScores.math,
        selected.profile.subjectScores.english,
        selected.profile.subjectScores.physics,
        selected.profile.subjectScores.chemistry,
        selected.profile.subjectScores.biology,
        selected.profile.subjectScores.politics,
        selected.profile.subjectScores.history,
        selected.profile.subjectScores.geography,
        selected.profile.scoreNotes,
      ];
      const profileCsv = [
        profileHeaders.map(csvEscape).join(","),
        profileValues.map(csvEscape).join(","),
      ].join("\n");
      zip.addFile(`${studentName}基础档案.csv`, toUtf8BOM(profileCsv));

      // 2. 问卷测评
      const surveysToExport = [
        { key: "studentMbti" as const, filename: `${studentName}学习性格.csv` },
        { key: "vark" as const, filename: `${studentName}学习风格.csv` },
        { key: "learningMotivation" as const, filename: `${studentName}学习动力.csv` },
        { key: "cognition" as const, filename: `${studentName}学习认知.csv` },
      ];

      for (const item of surveysToExport) {
        const survey = SURVEY_CATALOG.surveys.find((s) => s.key === item.key);
        if (!survey) {
          continue;
        }

        const section = selected.sections[item.key];
        const rows = [["题号", "题目内容", "回答内容"].map(csvEscape).join(",")];

        survey.questions.forEach((question, index) => {
          const answerId = section?.answers[question.id] ?? "";
          const option = question.options.find((opt) => opt.id === answerId);
          const answerLabel = option?.label ?? "";
          rows.push([index + 1, question.prompt, answerLabel].map(csvEscape).join(","));
        });

        zip.addFile(item.filename, toUtf8BOM(rows.join("\n")));
      }

      const blob = zip.generate();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `${studentName}-5张测评量表.zip`;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch {
      setError("导出 CSV 压缩包失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      return;
    }
    const confirmed = window.confirm("确认删除这条提交记录吗？删除后无法恢复。");
    if (!confirmed) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await deleteAdminRecord(id, token);
      setRecords((current) => current.filter((item) => item.id !== id));
      const removedSelected = selected?.id === id;
      setSelected((current) => (current?.id === id ? null : current));
      setSelectedSurveyKey((current) => (removedSelected ? null : current));
    } catch (requestError) {
      setError(getMessage(requestError, "删除失败"));
    } finally {
      setLoading(false);
    }
  };

  const selectedSurvey =
    selectedSurveyKey && selected
      ? SURVEY_CATALOG.surveys.find((survey) => survey.key === selectedSurveyKey) ?? null
      : null;

  const selectedSurveyAnswerRows =
    selectedSurvey && selected
      ? buildAnswerRows(selectedSurvey, selected.sections[selectedSurvey.key].answers)
      : [];

  const guardianSurvey = SURVEY_CATALOG.surveys.find((survey) => survey.key === "guardianMbti");
  const guardianResult =
    selected && guardianSurvey
      ? calculateGuardianMbti(guardianSurvey, selected.sections.guardianMbti.answers)
      : null;

  return (
    <div className="page-shell admin-shell">
      <header className="hero-strip admin">
        <div>
          <p className="eyebrow">AI 提分叶路春</p>
          <h1>提交后台</h1>
          <p className="hero-copy">查看家长与学生分时提交的数据、进度和导出结果。</p>
        </div>
      </header>
      {error ? <div className="toast error">{error}</div> : null}
      {!token ? (
        <section className="board board-home">
          <div className="stack-card narrow">
            <h2>后台登录</h2>
            <label className="field">
              <span>后台密码</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button type="button" className="primary" onClick={handleLogin} disabled={loading}>
              {loading ? "登录中..." : "进入后台"}
            </button>
          </div>
        </section>
      ) : (
        <section className="board">
          <div className="dashboard">
            <div className="dashboard-column wide">
              <section className="stack-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">提交列表</p>
                    <h2>{records.length} 条记录</h2>
                  </div>
                  <div className="button-row">
                    <button type="button" className="secondary" onClick={() => refreshList(token)}>
                      刷新
                    </button>
                    <button type="button" className="primary" onClick={handleExport}>
                      导出 CSV
                    </button>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>学生</th>
                        <th>学校</th>
                        <th>内部编号</th>
                        <th>进度</th>
                        <th>更新时间</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((item) => (
                        <tr key={item.id} onClick={() => handleSelect(item.id)}>
                          <td>{item.studentName || "未填写"}</td>
                          <td>{item.schoolName || "未填写"}</td>
                          <td>{item.accessCode}</td>
                          <td>{completionSummary(item.completion)}</td>
                          <td>{formatDateTime(item.updatedAt)}</td>
                          <td>
                            <button
                              type="button"
                              className="danger-button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDelete(item.id);
                              }}
                              disabled={loading}
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="dashboard-column">
              <section className="stack-card">
                <p className="eyebrow">详情</p>
                <h2>{selected ? selected.profile.studentName || "未填写姓名" : "选择一条记录"}</h2>
                {selected ? (
                  <div className="detail-stack">
                    <div className="detail-actions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={handleExportSelected}
                        disabled={loading}
                      >
                        导出本条 JSON
                      </button>
                      <button
                        type="button"
                        className="primary"
                        onClick={handleExportSelectedCsvs}
                        disabled={loading}
                      >
                        下载 5 张 CSV 表格
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => void handleDelete(selected.id)}
                        disabled={loading}
                      >
                        删除这条记录
                      </button>
                    </div>
                    <p>学校：{selected.profile.schoolName || "未填写"}</p>
                    <p>年级：{selected.profile.grade || "未填写"}</p>
                    <p>
                      家长：{selected.profile.guardianName || "未填写"} /{" "}
                      {selected.profile.guardianRole || "未填写"}
                    </p>
                    <p>性别：{selected.profile.gender || "未填写"}</p>
                    <p>
                      成绩：
                      {Object.entries(selected.profile.subjectScores)
                        .filter(([, value]) => value)
                        .map(([key, value]) => `${subjectLabel(key)} ${value}`)
                        .join("，") || "未填写"}
                    </p>
                    <p>备注：{selected.profile.scoreNotes || "无"}</p>
                    <div className="status-list compact">
                      <li>{completionSummary(selected.completion)}</li>
                    </div>
                    <div className="survey-admin-tabs">
                      {SURVEY_CATALOG.surveys.filter((survey) => survey.key !== "guardianMbti").map((survey) => {
                        const section = selected.sections[survey.key];
                        const answeredCount = countAnswered(survey, section.answers);
                        return (
                          <button
                            key={survey.key}
                            type="button"
                            className={
                              selectedSurveyKey === survey.key
                                ? "admin-tab active"
                                : "admin-tab"
                            }
                            onClick={() => setSelectedSurveyKey(survey.key)}
                          >
                            <span>{survey.shortTitle}</span>
                            <strong>
                              {answeredCount}/{survey.questions.length}
                            </strong>
                          </button>
                        );
                      })}
                    </div>
                    {selectedSurvey ? (
                      <section className="answer-sheet">
                        <div className="answer-sheet-head">
                          <div>
                            <p className="eyebrow">
                              {selectedSurvey.audience === "guardian" ? "家长问卷" : "学生问卷"}
                            </p>
                            <h3>{selectedSurvey.title}</h3>
                          </div>
                          <div className="answer-sheet-meta">
                            <span>
                              {selected.sections[selectedSurvey.key].completed
                                ? "已提交"
                                : "未提交"}
                            </span>
                            <span>
                              已答 {selectedSurveyAnswerRows.length}/{selectedSurvey.questions.length}
                            </span>
                          </div>
                        </div>
                        {selectedSurvey.key === "guardianMbti" && guardianResult ? (
                          <div className="admin-result-card">
                            <div>
                              <span>家长 MBTI</span>
                              <strong>{guardianResult.typeCode}</strong>
                            </div>
                            <p>
                              {guardianResult.percentages
                                .map(
                                  (item) =>
                                    `${item.dominant} ${item.percentage}% (${item.left}/${item.right})`,
                                )
                                .join("  ")}
                            </p>
                          </div>
                        ) : null}
                        {selectedSurveyAnswerRows.length ? (
                          <div className="answer-list">
                            {selectedSurveyAnswerRows.map((row) => (
                              <article key={row.questionId} className="answer-card">
                                <div className="answer-card-top">
                                  <span>第 {row.index} 题</span>
                                  <code>{row.questionId}</code>
                                </div>
                                <h4>{row.prompt}</h4>
                                <p>{row.answerLabel}</p>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <p>这份问卷还没有答题记录。</p>
                        )}
                      </section>
                    ) : null}
                  </div>
                ) : (
                  <p>点击左侧任意记录查看。</p>
                )}
              </section>
            </div>
          </div>
        </section>
      )}
      <SiteFooter />
    </div>
  );
}

function firstIncompleteIndex(survey: SurveyDefinition, answers: AnswerMap) {
  const index = survey.questions.findIndex((question) => !answers[question.id]);
  return index === -1 ? survey.questions.length - 1 : index;
}

function firstAnsweredSurveyKey(record: AdminDetail) {
  return (
    SURVEY_CATALOG.surveys
      .filter((survey) => survey.key !== "guardianMbti")
      .find((survey) =>
        countAnswered(survey, record.sections[survey.key].answers) > 0,
      )?.key ?? SURVEY_CATALOG.surveys[0]?.key ?? null
  );
}

function buildAnswerRows(survey: SurveyDefinition, answers: AnswerMap) {
  return survey.questions
    .map((question, index) => {
      const selectedOption = question.options.find((option) => option.id === answers[question.id]);
      if (!selectedOption) {
        return null;
      }
      return {
        index: index + 1,
        questionId: question.id,
        prompt: question.prompt,
        answerLabel: selectedOption.label,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function countAnswered(survey: SurveyDefinition, answers: AnswerMap) {
  return survey.questions.filter((question) => Boolean(answers[question.id])).length;
}

function completionSummary(completion: PublicRecord["completion"]) {
  const total = Object.entries(completion).filter(([key]) => key !== "profile").length + 1;
  const done = Object.values(completion).filter(Boolean).length;
  return `${done}/${total} 已完成`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    hour12: false,
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function subjectLabel(key: string) {
  const map: Record<string, string> = {
    chinese: "语文",
    math: "数学",
    english: "英语",
    physics: "物理",
    chemistry: "化学",
    biology: "生物",
    politics: "政治",
    history: "历史",
    geography: "地理",
  };
  return map[key] ?? key;
}

class SimpleZip {
  private files: { name: string; content: Uint8Array<ArrayBuffer> }[] = [];

  addFile(name: string, content: Uint8Array) {
    const normalized = new Uint8Array(content.length);
    normalized.set(content);
    this.files.push({ name, content: normalized });
  }

  private makeCrcTable(): number[] {
    const table: number[] = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        if (c & 1) {
          c = 0xedb88320 ^ (c >>> 1);
        } else {
          c = c >>> 1;
        }
      }
      table[n] = c;
    }
    return table;
  }

  private calculateCrc(data: Uint8Array): number {
    const table = this.makeCrcTable();
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  generate(): Blob {
    const buffers: BlobPart[] = [];
    const localHeaders: { offset: number; size: number; crc: number; name: string }[] = [];
    let currentOffset = 0;

    const writeNum = (val: number, len: number): Uint8Array => {
      const buf = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        buf[i] = (val >>> (i * 8)) & 0xff;
      }
      return buf;
    };

    for (const file of this.files) {
      const nameBytes = new TextEncoder().encode(file.name);
      const crc = this.calculateCrc(file.content);
      const size = file.content.length;

      const header = new Uint8Array(30);
      header.set([0x50, 0x4b, 0x03, 0x04]);
      header.set(writeNum(10, 2), 4);
      header.set(writeNum(0, 2), 6);
      header.set(writeNum(0, 2), 8);
      header.set(writeNum(0, 2), 10);
      header.set(writeNum(0, 2), 12);
      header.set(writeNum(crc, 4), 14);
      header.set(writeNum(size, 4), 18);
      header.set(writeNum(size, 4), 22);
      header.set(writeNum(nameBytes.length, 2), 26);
      header.set(writeNum(0, 2), 28);

      buffers.push(header);
      buffers.push(nameBytes);
      buffers.push(file.content);

      localHeaders.push({ offset: currentOffset, size, crc, name: file.name });
      currentOffset += header.length + nameBytes.length + size;
    }

    const centralDirectoryStart = currentOffset;
    let centralDirectorySize = 0;

    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      const lh = localHeaders[i];
      const nameBytes = new TextEncoder().encode(file.name);

      const cdHeader = new Uint8Array(46);
      cdHeader.set([0x50, 0x4b, 0x01, 0x02]);
      cdHeader.set(writeNum(10, 2), 4);
      cdHeader.set(writeNum(10, 2), 6);
      cdHeader.set(writeNum(0, 2), 8);
      cdHeader.set(writeNum(0, 2), 10);
      cdHeader.set(writeNum(0, 2), 12);
      cdHeader.set(writeNum(0, 2), 14);
      cdHeader.set(writeNum(lh.crc, 4), 16);
      cdHeader.set(writeNum(lh.size, 4), 20);
      cdHeader.set(writeNum(lh.size, 4), 24);
      cdHeader.set(writeNum(nameBytes.length, 2), 28);
      cdHeader.set(writeNum(0, 2), 30);
      cdHeader.set(writeNum(0, 2), 32);
      cdHeader.set(writeNum(0, 2), 34);
      cdHeader.set(writeNum(0, 2), 36);
      cdHeader.set(writeNum(0, 4), 38);
      cdHeader.set(writeNum(lh.offset, 4), 42);

      buffers.push(cdHeader);
      buffers.push(nameBytes);
      centralDirectorySize += cdHeader.length + nameBytes.length;
    }

    const eocd = new Uint8Array(22);
    eocd.set([0x50, 0x4b, 0x05, 0x06]);
    eocd.set(writeNum(0, 2), 4);
    eocd.set(writeNum(0, 2), 6);
    eocd.set(writeNum(this.files.length, 2), 8);
    eocd.set(writeNum(this.files.length, 2), 10);
    eocd.set(writeNum(centralDirectorySize, 4), 12);
    eocd.set(writeNum(centralDirectoryStart, 4), 16);
    eocd.set(writeNum(0, 2), 20);

    buffers.push(eocd);

    return new Blob(buffers, { type: "application/zip" });
  }
}

function toUtf8BOM(text: string): Uint8Array {
  const encoder = new TextEncoder();
  const arr = encoder.encode(text);
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const result = new Uint8Array(bom.length + arr.length);
  result.set(bom, 0);
  result.set(arr, bom.length);
  return result;
}

function csvEscape(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes("\n") || str.includes("\r") || str.includes('"')) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

export default App;
