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
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      setCurrentPath(window.location.pathname);
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      setCurrentPath(window.location.pathname);
    };

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const navigate = (path: string) => {
    if (path === "/" && window.location.hostname.startsWith("survey.")) {
      window.location.href = "https://aitifen.cc/";
      return;
    }
    window.history.pushState(null, "", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isSurveyDomain = window.location.hostname.startsWith("survey.");

  if (currentPath.startsWith("/admin")) {
    return <AdminApp navigate={navigate} />;
  }

  if (currentPath === "/survey" || (currentPath === "/" && isSurveyDomain)) {
    return <PublicApp navigate={navigate} forceRole="student" />;
  }

  if (currentPath === "/guardian" || currentPath.startsWith("/guardian/")) {
    return <PublicApp navigate={navigate} forceRole="guardian" />;
  }

  return <OfficialSite navigate={navigate} />;
}

function PublicApp({ navigate, forceRole }: { navigate: (path: string) => void; forceRole?: PublicRole }) {
  const surveys = SURVEY_CATALOG.surveys;
  const isGuardianUrl =
    forceRole === "guardian" ||
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
          <button
            type="button"
            className="back-to-home-link"
            onClick={() => {
              if (roleMode === "guardian" && activeSurveyKey) {
                if (window.confirm("确定要放弃当前的家长MBTI答题并返回官网吗？")) {
                  navigate("/");
                }
              } else if (record && activeSurveyKey) {
                if (window.confirm("测评进度已自动保存，确定要返回官网吗？")) {
                  navigate("/");
                }
              } else {
                navigate("/");
              }
            }}
          >
            ← 返回官网
          </button>
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
                  {roleMode === "guardian" && (
                    <div className="guardian-report-extra-actions" style={{ marginTop: "24px", textAlign: "center" }}>
                      <button type="button" className="primary" onClick={() => navigate("/")}>
                        完成测试，返回官网
                      </button>
                    </div>
                  )}
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
                      <div className="completion-action-box" style={{ marginTop: "16px" }}>
                        <p className="completion-note" style={{ marginBottom: "8px" }}>已完成</p>
                        <button type="button" className="primary" onClick={() => navigate("/")}>
                          返回官网
                        </button>
                      </div>
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

function AdminApp({ navigate }: { navigate: (path: string) => void }) {
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
          <button type="button" className="back-to-home-link" onClick={() => navigate("/")}>
            ← 返回官网
          </button>
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

function OfficialSite({ navigate }: { navigate: (path: string) => void }) {
  const [activeIcebergPart, setActiveIcebergPart] = useState<"top" | "personality" | "style" | "motivation" | "cognition">("top");

  const icebergData = {
    top: {
      title: "冰山一角：学科成绩",
      desc: "学科成绩只是海面上露出的一角（仅占10%），由海面下的底层要素决定。很多时候单纯刷题只能补冰山之巅，无法改变冰山之底。",
      tips: "只抓成绩是“治标”，解决底层的学习力才能“治本”。"
    },
    personality: {
      title: "底层要素：学习性格 (MBTI)",
      desc: "决定孩子是外向还是内向、是凭直觉还是重逻辑。比如：内向逻辑型的孩子适合独自整理，而外向直觉型的孩子通过费曼学习法（教别人）提分最快。",
      tips: "适配性格，能让学习顺应天性，不再有拧巴和对抗。"
    },
    style: {
      title: "底层要素：学习风格 (VARK)",
      desc: "孩子对视觉、听觉、阅读和动手操作的敏感度不同。视觉型孩子需要画思维导图，听觉型需要讨论和讲解，操作型需要在场景中练习。",
      tips: "找到适配的风格，能让记忆和理解效率瞬间提升 2-3 倍。"
    },
    motivation: {
      title: "底层要素：学习动力",
      desc: "决定了孩子为什么要学习。有的是为了同伴认可（关系驱动），有的是追求自我超越（成就驱动），有的是避免惩罚。识别底层动力，才能精准激发主动性。",
      tips: "动力不足时，强行塞满周末补习班往往只会招致叛逆。"
    },
    cognition: {
      title: "底层要素：学习认知",
      desc: "对知识的归纳演绎、对错题的归因方式以及对问题解决路径的掌握。比如西蒙学习法、费曼学习法的应用基础。",
      tips: "认知升级，是把“努力做题”变成“清晰建构”的必经之路。"
    }
  };

  return (
    <div className="page-shell official-shell">
      {/* 极简顶栏 */}
      <nav className="official-nav">
        <div className="nav-logo">
          <span className="logo-badge">AI 提分叶路春</span>
        </div>
        <div className="nav-actions">
          <button type="button" className="nav-btn primary" onClick={() => navigate("/survey")}>
            学生测评
          </button>
        </div>
      </nav>

      {/* Hero 区域 */}
      <header className="official-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">自主学习 × 人工智能 (AI)</p>
          <h1 className="hero-title">
            自主学习是学霸的<span>标配</span><br />
            自主学习 × AI 是学霸的<span>顶配</span>
          </h1>
          <p className="hero-subtitle">
            AI 是加速器，不是方向盘。先学会自主学习，再用 AI 精准提分。
          </p>
          <div className="hero-cta-group">
            <button type="button" className="cta-btn primary-pulse" onClick={() => navigate("/survey")}>
              <span>开始学生 MCA 测评</span>
              <small>免费体验 · 包含4大维度</small>
            </button>
            <button type="button" className="cta-btn secondary-glow" onClick={() => navigate("/guardian")}>
              <span>家长 MBTI 测评</span>
              <small>了解亲子沟通密码</small>
            </button>
          </div>
          <p className="hero-age-hint">适合四年级及以上学生</p>
        </div>
        <div className="hero-visual">
          <div className="visual-card-wrapper">
            <div className="visual-card formula-card">
              <span className="card-badge">原创定律</span>
              <h4>学习第一定律</h4>
              <div className="formula-display">
                <span className="formula-main">成绩 = 时间 × 效率 × 精度 × 深度</span>
              </div>
              <p>四维决定上限，拒绝无效刷题与低效苦学。</p>
            </div>
            <div className="visual-card iceberg-mini">
              <h4>冰山理论</h4>
              <p>成绩只是海面上的10%</p>
              <div className="mini-iceberg-svg">
                <svg viewBox="0 0 100 80" className="iceberg-svg">
                  <path d="M 50 10 L 35 45 L 65 45 Z" className="iceberg-tip" />
                  <line x1="10" y1="45" x2="90" y2="45" className="sea-level" />
                  <path d="M 35 45 L 20 75 L 80 75 L 65 45 Z" className="iceberg-base" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 冰山理论交互区 */}
      <section className="official-section iceberg-section">
        <div className="section-header">
          <span className="section-tag">核心方法论一</span>
          <h2>冰山理论：看清海面下的底层逻辑</h2>
          <p className="section-desc">
            学科成绩只是冰山一角，它是由底层的性格、风格、动力与认知共同决定的。
          </p>
        </div>

        <div className="iceberg-grid">
          <div className="iceberg-interactive">
            <div className="iceberg-container">
              {/* 海面以上 */}
              <div 
                className={`iceberg-part tip ${activeIcebergPart === "top" ? "active" : ""}`}
                onClick={() => setActiveIcebergPart("top")}
              >
                <span className="part-label">海面以上 (10%)</span>
                <strong>学科成绩</strong>
              </div>
              
              <div className="water-line">
                <span>海平面</span>
              </div>
              
              {/* 海面以下 */}
              <div className="iceberg-underwater">
                <div 
                  className={`iceberg-part base ${activeIcebergPart === "personality" ? "active" : ""}`}
                  onClick={() => setActiveIcebergPart("personality")}
                >
                  <strong>01 学习性格 (MBTI)</strong>
                </div>
                <div 
                  className={`iceberg-part base ${activeIcebergPart === "style" ? "active" : ""}`}
                  onClick={() => setActiveIcebergPart("style")}
                >
                  <strong>02 学习风格 (VARK)</strong>
                </div>
                <div 
                  className={`iceberg-part base ${activeIcebergPart === "motivation" ? "active" : ""}`}
                  onClick={() => setActiveIcebergPart("motivation")}
                >
                  <strong>03 学习动力</strong>
                </div>
                <div 
                  className={`iceberg-part base ${activeIcebergPart === "cognition" ? "active" : ""}`}
                  onClick={() => setActiveIcebergPart("cognition")}
                >
                  <strong>04 学习认知</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="iceberg-details">
            <div className="detail-panel">
              <span className="detail-kicker">已选中板块说明</span>
              <h3>{icebergData[activeIcebergPart].title}</h3>
              <p className="detail-body">{icebergData[activeIcebergPart].desc}</p>
              <div className="detail-tips">
                <strong>专家洞察：</strong>
                <span>{icebergData[activeIcebergPart].tips}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 学习第一定律 */}
      <section className="official-section formula-section">
        <div className="section-header">
          <span className="section-tag">核心方法论二</span>
          <h2>学习第一定律：四维决定成绩上限</h2>
          <p className="section-desc">
            真正的提分并非死记硬背，而是有据可依的系统优化。
          </p>
        </div>

        <div className="formula-card-large">
          <div className="formula-math-display">
            <span className="formula-item keyword">学习成绩</span>
            <span className="formula-symbol">=</span>
            <span className="formula-item">学习时间</span>
            <span className="formula-symbol">×</span>
            <span className="formula-item">学习效率</span>
            <span className="formula-symbol">×</span>
            <span className="formula-item">学习精度</span>
            <span className="formula-symbol">×</span>
            <span className="formula-item">学习深度</span>
          </div>
          <div className="formula-grid">
            <div className="formula-factor-item">
              <div className="factor-num">1</div>
              <h4>学习时间</h4>
              <p>不仅是学习时长，更重要的是觉察自身生物钟，找出最高效的学习节奏，进行自我节律管理。</p>
            </div>
            <div className="formula-factor-item">
              <div className="factor-num">2</div>
              <h4>学习效率</h4>
              <p>课堂是学习的主战场，把课堂效率拉到极致。课外的一两个小时只是杠杆，用于撬动学校的高效听课能力。</p>
            </div>
            <div className="formula-factor-item">
              <div className="formula-num">3</div>
              <h4>学习精度</h4>
              <p>“哪里不会学哪里”，利用思维导图和错题本，对错题进行多维度归因分析，精准扫除知识盲区。</p>
            </div>
            <div className="formula-factor-item">
              <div className="formula-num">4</div>
              <h4>学习深度</h4>
              <p>从“被动吸收”升级为“主动演绎”。融合西蒙学习法、费曼学习法，利用 AI 辅助将知识融会贯通。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 学习三大战场 */}
      <section className="official-section battlefield-section">
        <div className="section-header">
          <span className="section-tag">核心方法论三</span>
          <h2>学习三大战场：用周末补习杠杆学校学习</h2>
          <p className="section-desc">我们做的是周末补习，但底层目标是推动学校学习 — 让孩子把课堂效率拉到极致。</p>
        </div>
        <div className="battlefield-grid">
          <div className="bf-card bf-school">
            <div className="bf-icon">🏫</div>
            <h3>学校学习</h3>
            <span className="bf-tag">主战场</span>
            <p>课堂是学习的主阵地，占据孩子最大比例的学习时间。课堂效率是成绩的第一杠杆。</p>
          </div>
          <div className="bf-arrow">←</div>
          <div className="bf-card bf-home">
            <div className="bf-icon">🏠</div>
            <h3>家庭学习</h3>
            <span className="bf-tag">巩固地</span>
            <p>放学后 1-2 小时的黄金复习时间，是预习、错题消化、进步表反思的关键场景。</p>
          </div>
          <div className="bf-arrow">←</div>
          <div className="bf-card bf-weekend">
            <div className="bf-icon">🎯</div>
            <h3>周末补习</h3>
            <span className="bf-tag">杠杆点</span>
            <p>我们在这里。但我们不是刷题，而是教会孩子提升课堂效率、掌握自主学习方法，让每一个小时都推动学校的一整周。</p>
          </div>
        </div>
      </section>

      {/* 自主学习六步法 */}
      <section className="official-section sixstep-section">
        <div className="section-header">
          <span className="section-tag">核心方法论四</span>
          <h2>自主学习六步闭环</h2>
          <p className="section-desc">课程只是学习的六分之一。真正的学习，发生在完整的六步闭环中。</p>
        </div>
        <div className="sixstep-flow">
          <div className="sixstep-item"><div className="sixstep-num">01</div><h4>预习</h4><p>带着目标进课堂，变被动为主动</p></div>
          <div className="sixstep-item"><div className="sixstep-num">02</div><h4>听课</h4><p>课堂效率拉满，聚焦核心知识点</p></div>
          <div className="sixstep-item"><div className="sixstep-num">03</div><h4>做作业</h4><p>独立完成，暴露真实知识漏洞</p></div>
          <div className="sixstep-item"><div className="sixstep-num">04</div><h4>归纳演绎</h4><p>归纳总结，用费曼法深化理解</p></div>
          <div className="sixstep-item"><div className="sixstep-num">05</div><h4>考试</h4><p>知识漏洞探测器，不是终点</p></div>
          <div className="sixstep-item"><div className="sixstep-num">06</div><h4>错题整理</h4><p>归因分析 → AI 强化 → 彻底消灭</p></div>
        </div>
        <p className="sixstep-quote">“课程只是六分之一，真正的提分发生在完整的闭环中。”</p>
      </section>

      {/* 测评 x AI 超级玩法 */}
      <section className="official-section ai-boost-section">
        <div className="section-header">
          <span className="section-tag">核心亮点</span>
          <h2>测评报告 × AI = 最懂孩子的专属导师</h2>
          <p className="section-desc">表面花了几十块做测评，投喂给 AI 后，它就变成了最懂你孩子的私人导师。</p>
        </div>
        <div className="ai-boost-card">
          <div className="boost-flow">
            <div className="boost-step"><div className="boost-icon">📋</div><h4>完成 MCA 测评</h4><p>4 维度多维画像报告</p></div>
            <div className="boost-arrow">→</div>
            <div className="boost-step"><div className="boost-icon">🤖</div><h4>投喂给 AI</h4><p>ChatGPT / DeepSeek / 豆包</p></div>
            <div className="boost-arrow">→</div>
            <div className="boost-step"><div className="boost-icon">✨</div><h4>精准输出</h4><p>AI 秒变专属导师</p></div>
          </div>
          <div className="boost-usecases">
            <h4>AI 能帮孩子做什么？</h4>
            <div className="boost-tags">
              <span>📅 定制个性化学习计划</span>
              <span>📝 精准讲解错题原因</span>
              <span>🧠 用孩子听得懂的方式拆解概念</span>
              <span>🎯 针对薄弱环节出专属练习</span>
              <span>🔁 艾宾浩斯抗遗忘复习提醒</span>
              <span>🏀 结合兴趣场景化背单词</span>
            </div>
          </div>
        </div>
      </section>

      {/* 提分三阶段闭环 */}
      <section className="official-section loop-section">
        <div className="section-header">
          <span className="section-tag">提分服务路径</span>
          <h2>三阶段闭环：如何利用 AI 精准提分</h2>
          <p className="section-desc">
            从测评洞察到 AI 赋能，再到清北学霸伴学，我们将方法论彻底转化为学习习惯。
          </p>
        </div>

        <div className="loop-timeline">
          <div className="timeline-item">
            <div className="timeline-badge">第一阶段</div>
            <div className="timeline-card">
              <h3>测评洞察与适配 (MCA 测评)</h3>
              <p>通过包含 4 大维度的 MCA 学习力问卷，全方位透视孩子海面下的底层学习特质，形成极高准度的“多维度画像报告”。</p>
              <div className="timeline-card-sub">
                <strong>核心价值：</strong>将这份报告投喂给 DeepSeek, ChatGPT 等 AI，让 AI 变成最懂孩子的专属导师，做计划、改错题、讲概念精准度倍增。
              </div>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-badge">第二阶段</div>
            <div className="timeline-card">
              <h3>自主学习与 AI 能力课 (6小时)</h3>
              <p>6 节系统课。前 3 节打通“自主学习”底座（画思维导图、错题消化、PDCA循环等）；后 3 节培养 AI 提问力、协作力、创造力与判断力。</p>
              <div className="timeline-card-sub">
                <strong>独家特色：</strong>全程由“学生投屏”给老师，孩子亲自敲下指令（Prompt），现场实操如何向 AI 精准发问、如何甄别 AI 幻觉。
              </div>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-badge">第三阶段</div>
            <div className="timeline-card">
              <h3>清北学霸伴学与知行合一 (辅导与习惯)</h3>
              <p>300+ 清华、北京大学学霸个性化伴学。针对数理化、英语重难点精准强补，并采用番茄钟机制，陪伴孩子实操落地所学方法。</p>
              <div className="timeline-card-sub">
                <strong>核心目标：</strong>帮助孩子从“知道”走向“做到”。在日常学习中养成画教材思维导图、每日 PDCA 进步表总结、艾宾浩斯抗遗忘等终身习惯。
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 提分案例 */}
      <section className="official-section cases-section">
        <div className="section-header">
          <span className="section-tag">真实成效</span>
          <h2>精选提分案例</h2>
          <p className="section-desc">
            见证通过“自主学习 × AI”方法论实现逆袭的学生故事。
          </p>
        </div>

        <div className="cases-grid">
          <article className="case-card">
            <div className="case-header">
              <span className="case-subject math">数学</span>
              <h3>抗拒学校的初二少年</h3>
              <div className="case-stat">数学从 <strong>45分</strong> 提到 <strong>120分</strong></div>
            </div>
            <p className="case-body">
              因跟不上学校标准化节奏，该同学产生严重厌学情绪，抗拒去学校。加入后居家自主学习 2-3 个月，利用教材思维导图与 AI 工具锁定弱项错题进行精度补强，最终顺利重拾信心返回学校主战场。
            </p>
          </article>

          <article className="case-card">
            <div className="case-header">
              <span className="case-subject math">数学</span>
              <h3>初二同学的思维导图突破</h3>
              <div className="case-stat">一个月从 <strong>63分</strong> 提升至 <strong>89分</strong></div>
            </div>
            <p className="case-body">
              重点训练其绘制“思维导图”的技能。该同学在十一期间通过手绘和 Xmind 成功将初一至初三的所有数学教材画成了三张宏观思维导图。配合导图，逐一对应分析错题，快速弥补了知识漏洞。
            </p>
          </article>

          <article className="case-card">
            <div className="case-header">
              <span className="case-subject ai">AI + 伴学</span>
              <h3>北京初二女生的效率优化</h3>
              <div className="case-stat">解决 <strong>“低效苦学”</strong> 难题</div>
            </div>
            <p className="case-body">
              在北大元培（AI/计算机方向）学霸的一对一伴学下，这位极其刻苦但效率低下的女生重构了错题整理逻辑。学会通过向 AI 投喂自己的画像来获取最易懂的讲解，彻底实现了“知行合一”的转化。
            </p>
          </article>

          <article className="case-card">
            <div className="case-header">
              <span className="case-subject english">英语</span>
              <h3>英语 45 分到稳步提升</h3>
              <div className="case-stat">150满分仅得 <strong>45分</strong> → 词汇突破</div>
            </div>
            <p className="case-body">
              将英语拆解到最小单元 —— 只抓词汇和阅读。每天背 15-30 个单词，结合 AI 将单词嵌入孩子感兴趣的场景（打篮球、游戏等），让枯燥的记忆变得有趣。英语提分率高达 90-95%。
            </p>
          </article>
        </div>
      </section>

      {/* 创始人简介 */}
      <section className="official-section founder-section">
        <div className="section-header">
          <span className="section-tag">关于我们</span>
          <h2>为什么选择 AI提分</h2>
        </div>
        <div className="founder-card">
          <div className="founder-info">
            <h3>叶路春 · 创始人</h3>
            <div className="founder-tags">
              <span>AI 工具研究者（全网千万播放量）</span>
              <span>前 AI 智习室创始人（100+ 门店）</span>
            </div>
            <p className="founder-desc">研究人工智能的过程中，发现 AI 对成年人的提效极其显著，因此切入 AI 赋能教育赛道。长期深耕三大领域：个性化教育（对标 AlphaSchool、可汗学院、北京十一学校）、自主学习方法论、AI 赋能学习。</p>
            <div className="founder-cross"><strong>跨学科研究底座：</strong>脑科学 · 心理学 · 教育学 · 信息论 · 系统论 · 控制论</div>
          </div>
          <div className="founder-stats">
            <div className="stat-item"><div className="stat-num">100+</div><div className="stat-label">提分案例</div></div>
            <div className="stat-item"><div className="stat-num">300+</div><div className="stat-label">清北学霸团队</div></div>
            <div className="stat-item"><div className="stat-num">90%+</div><div className="stat-label">英语提分率</div></div>
          </div>
        </div>
      </section>

      {/* 底部 CTA 引导 */}
      <section className="official-footer-cta">
        <h2>测评，是认识自己的开始</h2>
        <p>没有测评，就没有洞察。花 15-20 分钟做一次全面剖析，或者为自己配置学霸级的提分加速器。</p>
        <div className="cta-btn-group">
          <button type="button" className="cta-btn primary" onClick={() => navigate("/survey")}>
            开始学生 MCA 测评
          </button>
          <button type="button" className="cta-btn secondary" onClick={() => navigate("/guardian")}>
            家长 MBTI 测评
          </button>
        </div>
      </section>

      {/* 底部 */}
      <footer className="official-footer">
        <p>© 2026 AI 提分叶路春. All rights reserved.</p>
        <div className="footer-links">
          <span className="footer-link" onClick={() => navigate("/survey")}>学生入口</span>
          <span className="footer-separator">|</span>
          <span className="footer-link" onClick={() => navigate("/guardian")}>家长入口</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
