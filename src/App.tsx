import { useEffect, useMemo, useRef, useState } from "react";
import { GuardianResultReport } from "./components/GuardianResultReport";
import { SURVEY_CATALOG } from "./questionBank";
import {
  adminLogin,
  createRecord,
  deleteAdminRecord,
  downloadAdminCsv,
  getAdminRecord,
  listAdminRecords,
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
const studentSurveyLabels = ["MBTI 测评", "学习动力", "VARK", "学习认知"];

const devMode = import.meta.env.DEV;
type PublicRole = "student" | "guardian";

function App() {
  const isAdminRoute = window.location.pathname.startsWith("/admin");
  return isAdminRoute ? <AdminApp /> : <PublicApp />;
}

function PublicApp() {
  const surveys = SURVEY_CATALOG.surveys;
  const isGuardianUrl = window.location.pathname.startsWith("/guardian") || window.location.search.includes("role=guardian");

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
  const [showGuardianReport, setShowGuardianReport] = useState(false);
  const debounceTimer = useRef<number | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const draftHydrated = useRef(isGuardianUrl);

  const activeSurvey = useMemo(
    () => surveys.find((survey) => survey.key === activeSurveyKey) ?? null,
    [activeSurveyKey, surveys],
  );

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

    if (activeSurvey && questionIndex < activeSurvey.questions.length - 1) {
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
      transitionTimer.current = window.setTimeout(() => {
        setQuestionIndex((current) => current + 1);
        transitionTimer.current = null;
      }, 200);
    }
  };

  useEffect(() => {
    return () => {
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, [activeSurveyKey, questionIndex]);

  const handleOpenSurvey = (surveyKey: SurveyKey) => {
    if (!record) {
      return;
    }
    const survey = surveys.find((item) => item.key === surveyKey);
    if (!survey) {
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
      setRoleMode(null);
      setActiveSurveyKey(null);
      setSurveyDraft({});
      setQuestionIndex(0);
      if (window.location.pathname.startsWith("/guardian") || window.location.search.includes("role=guardian")) {
        window.history.pushState(null, "", "/");
      }
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
      const response = await saveSurveySection(
        record.accessCode,
        activeSurvey.key,
        surveyDraft,
        true,
      );
      setRecord(response.record);
      setActiveSurveyKey(null);
      setShowGuardianReport(activeSurvey.key === "guardianMbti");
      setLastSavedAt(formatTime(response.record.updatedAt));
    } catch (requestError) {
      setError(getMessage(requestError, "提交测评失败"));
    } finally {
      setLoading(false);
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
  const hasStarted = Boolean(record) || roleMode === "guardian";

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
    } catch (requestError) {
      setError(getMessage(requestError, "开发环境快速填充失败"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <header className="hero-strip">
        <div>
          <p className="eyebrow">MCA学习力测评</p>
          <h1>测评，是你认识自己的开始！</h1>
          <p className="hero-copy">请按提示完成测评，完成后我们会第一时间为您出具测评报告。</p>
        </div>
        {hasStarted ? (
          <div className="access-card">
            <span>当前测评</span>
            <strong>{roleMode === "guardian" ? "家长测评" : "学习力测评"}</strong>
            <small>{roleMode === "guardian" ? "提交后查看结果。" : "填完一项提交，再继续下一项。"}</small>
          </div>
        ) : (
          <div className="access-card subtle">
            <span>测评入口</span>
            <strong>学习力测评</strong>
            <small>基础档案 + 4 项测评</small>
          </div>
        )}
      </header>

      {error ? <div className="toast error">{error}</div> : null}
      {lastSavedAt ? <div className="toast success">最近保存：{lastSavedAt}</div> : null}

      {!hasStarted ? (
        <section className="board board-home">
          <article className="action-card home-primary-card">
            <p className="eyebrow">学习力测评</p>
            <h2>MCA学习力测评</h2>
            <p>先填写基础档案，再完成 4 项测评。</p>
            <button type="button" className="primary" onClick={() => handleStart("student")} disabled={loading}>
              {loading ? "正在进入..." : "开始测评"}
            </button>
          </article>
        </section>
      ) : null}

      {hasStarted ? (
        <section className="board">
          {activeSurvey ? (
            <div className="survey-shell">
              <div className="survey-topbar">
                <button type="button" className="ghost" onClick={handleSurveyBack}>
                  {roleMode === "guardian" && !record ? "返回首页" : "返回总览"}
                </button>
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
                  <p className="eyebrow">{activeSurvey.audience === "guardian" ? "家长填写" : "学生填写"}</p>
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
                          {roleMode === "guardian" && !record ? "提交并查看结果" : "完成并保存"}
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="dashboard">
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
                <section className="stack-card">
                  <p className="eyebrow">档案信息</p>
                  <div className="section-heading">
                      <div>
                        <h2>基础档案</h2>
                        <p>填写姓名、学校、年级和学科成绩。其余信息可以按实际情况选填。</p>
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
                              placeholder="如 112 / A / 班级前10%"
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
                        <p>快速造一条完整样例记录，直接验证后台、导出和完成态。</p>
                      </div>
                      <button type="button" className="ghost" onClick={fillAllSurveysForDev} disabled={loading}>
                        一键填完整套
                      </button>
                    </div>
                  </section>
                ) : null}

                <section className="stack-card">
                  <p className="eyebrow">测评步骤指导</p>
                  <h2>按顺序完成就可以</h2>
                  <ol className="step-list">
                    <li>填完一项</li>
                    <li>提交</li>
                    <li>继续填下一项</li>
                    <li>四项测评填完，告诉家长：“测评完，我们会第一时间给你出测评报告！”</li>
                  </ol>
                </section>

                <section className="stack-card">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">学习力测评</p>
                      <h2>4 项测评</h2>
                    </div>
                  </div>
                  <div className="survey-card-grid">
                    {surveys
                      .filter((survey) => studentSurveyKeys.includes(survey.key))
                      .map((survey) => (
                        <SurveyCard
                          key={survey.key}
                          survey={survey}
                          completed={record.completion[survey.key]}
                          answeredCount={countAnswered(
                            survey,
                            record.sections[survey.key].answers,
                          )}
                          onOpen={() => handleOpenSurvey(survey.key)}
                        />
                      ))}
                  </div>
                </section>
              </div>
              ) : null}

              {record ? (
              <div className="dashboard-column">
                {roleMode === "guardian" ? (
                  <section className="stack-card">
                    <p className="eyebrow">家长任务</p>
                    <h2>家长 MBTI 结果</h2>
                    <p>家长独立完成测评后，会直接生成结果页，方便当场查看和截图反馈。</p>
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

                <section className="stack-card">
                  <p className="eyebrow">测评进度</p>
                  <h2>完成后告诉家长</h2>
                  <ul className="status-list">
                    <li>{record.completion.profile ? "已完成" : "未完成"} 基础档案</li>
                    {studentSurveyKeys.map((key, index) => (
                      <li key={key}>
                        {record.completion[key] ? "已完成" : "未完成"} {studentSurveyLabels[index]}
                      </li>
                    ))}
                  </ul>
                  {studentSurveyKeys.every((key) => record.completion[key]) ? (
                    <p className="completion-note">测评完，我们会第一时间给你出测评报告！</p>
                  ) : null}
                </section>
              </div>
              ) : null}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
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

  const handleSelect = async (id: string) => {
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
  };

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
                      {SURVEY_CATALOG.surveys.map((survey) => {
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
    </div>
  );
}

function firstIncompleteIndex(survey: SurveyDefinition, answers: AnswerMap) {
  const index = survey.questions.findIndex((question) => !answers[question.id]);
  return index === -1 ? survey.questions.length - 1 : index;
}

function firstAnsweredSurveyKey(record: AdminDetail) {
  return (
    SURVEY_CATALOG.surveys.find((survey) =>
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

export default App;
