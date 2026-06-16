import { SURVEY_CATALOG } from "../src/questionBank";
import type {
  CompletionState,
  PublicRecord,
  StudentProfile,
  SurveyKey,
  SurveySectionState,
  SurveySections,
} from "../src/types";

interface AppEnv extends Env {
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
}

type RecordRow = {
  id: string;
  access_code: string;
  owner_label: string;
  student_name: string;
  school_name: string;
  grade: string;
  gender: string;
  guardian_name: string;
  guardian_role: string;
  subject_scores_json: string;
  score_notes: string;
  profile_json: string;
  sections_json: string;
  completion_json: string;
  created_at: string;
  updated_at: string;
};

const surveyKeys: SurveyKey[] = [
  "studentMbti",
  "learningMotivation",
  "vark",
  "cognition",
  "guardianMbti",
];

const emptyProfile = (): StudentProfile => ({
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

const emptySection = (): SurveySectionState => ({
  answers: {},
  completed: false,
  updatedAt: null,
  completedAt: null,
});

const emptySections = (): SurveySections => ({
  studentMbti: emptySection(),
  learningMotivation: emptySection(),
  vark: emptySection(),
  cognition: emptySection(),
  guardianMbti: emptySection(),
});

const emptyCompletion = (): CompletionState => ({
  profile: false,
  studentMbti: false,
  learningMotivation: false,
  vark: false,
  cognition: false,
  guardianMbti: false,
});

const json = (data: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });

const text = (body: string, status = 200, headers?: HeadersInit) =>
  new Response(body, {
    status,
    headers,
  });

const parseJson = async <T>(request: Request): Promise<T> => {
  return (await request.json()) as T;
};

const parseStoredJson = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const mergeProfile = (input: Partial<StudentProfile>): StudentProfile => {
  const base = emptyProfile();
  const subjectScores = {
    ...base.subjectScores,
    ...(input.subjectScores ?? {}),
  };

  return {
    ...base,
    ...input,
    subjectScores,
  };
};

const profileIsComplete = (profile: StudentProfile) => {
  const coreScores = [
    profile.subjectScores.chinese,
    profile.subjectScores.math,
    profile.subjectScores.english,
  ];
  return Boolean(profile.studentName) || coreScores.some(Boolean) || Boolean(profile.scoreNotes);
};

const hydrateSections = (input: Partial<SurveySections>): SurveySections => {
  const base = emptySections();
  const result = { ...base };
  for (const key of surveyKeys) {
    if (input[key]) {
      result[key] = {
        ...base[key],
        ...input[key],
        answers: input[key]?.answers ?? base[key].answers,
      };
    }
  }
  return result;
};

const hydrateCompletion = (input: Partial<CompletionState>): CompletionState => ({
  ...emptyCompletion(),
  ...input,
});

const rowToRecord = (row: RecordRow): PublicRecord => {
  const storedProfile = parseStoredJson<Partial<StudentProfile>>(row.profile_json, {});
  const profile = mergeProfile({
    ...storedProfile,
    studentName: storedProfile.studentName || row.student_name,
    schoolName: storedProfile.schoolName || row.school_name,
    grade: storedProfile.grade || row.grade,
    gender: storedProfile.gender || row.gender,
    guardianName: storedProfile.guardianName || row.guardian_name,
    guardianRole: storedProfile.guardianRole || row.guardian_role,
    subjectScores:
      storedProfile.subjectScores ||
      parseStoredJson<StudentProfile["subjectScores"]>(row.subject_scores_json, emptyProfile().subjectScores),
    scoreNotes: storedProfile.scoreNotes || row.score_notes,
  });
  const sections = hydrateSections(
    parseStoredJson<Partial<SurveySections>>(row.sections_json, {}),
  );
  const completion = hydrateCompletion(
    parseStoredJson<Partial<CompletionState>>(row.completion_json, {}),
  );

  return {
    id: row.id,
    accessCode: row.access_code,
    ownerLabel: row.owner_label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    profile,
    sections,
    completion,
  };
};

const recordToListItem = (record: PublicRecord) => ({
  id: record.id,
  accessCode: record.accessCode,
  ownerLabel: record.ownerLabel,
  studentName: record.profile.studentName,
  schoolName: record.profile.schoolName,
  grade: record.profile.grade,
  guardianName: record.profile.guardianName,
  guardianRole: record.profile.guardianRole,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
  completion: record.completion,
});

const csvEscape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const surveyKeyLabel = (surveyKey: SurveyKey) =>
  SURVEY_CATALOG.surveys.find((survey) => survey.key === surveyKey)?.shortTitle ?? surveyKey;

const flattenAnswerColumns = (record: PublicRecord) =>
  SURVEY_CATALOG.surveys.flatMap((survey) =>
    survey.questions.map((question, index) => {
      const answerId = record.sections[survey.key].answers[question.id];
      const answerLabel = question.options.find((option) => option.id === answerId)?.label ?? "";
      return {
        header: `${surveyKeyLabel(survey.key)}_Q${String(index + 1).padStart(2, "0")}_${question.prompt}`,
        value: answerLabel,
      };
    }),
  );

const buildSingleRecordExport = (record: PublicRecord) => ({
  exportPurpose: "single-student-ai-analysis",
  exportedAt: new Date().toISOString(),
  record: {
    id: record.id,
    accessCode: record.accessCode,
    ownerLabel: record.ownerLabel,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  },
  profile: record.profile,
  completion: record.completion,
  surveys: SURVEY_CATALOG.surveys.map((survey) => {
    const section = record.sections[survey.key];
    const answers = survey.questions.map((question, index) => {
      const answerId = section.answers[question.id] ?? "";
      const option = question.options.find((item) => item.id === answerId);
      return {
        index: index + 1,
        questionId: question.id,
        prompt: question.prompt,
        answerId,
        answerLabel: option?.label ?? "",
        trait: option?.trait ?? null,
        answered: Boolean(option),
      };
    });

    return {
      key: survey.key,
      title: survey.title,
      shortTitle: survey.shortTitle,
      audience: survey.audience,
      completed: section.completed,
      updatedAt: section.updatedAt,
      completedAt: section.completedAt,
      answeredCount: answers.filter((answer) => answer.answered).length,
      totalQuestions: survey.questions.length,
      answers,
    };
  }),
});

const makeAccessCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 8; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
};

const getRecordByAccessCode = async (db: D1Database, accessCode: string) => {
  const result = await db
    .prepare("SELECT * FROM assessment_records WHERE access_code = ?1 LIMIT 1")
    .bind(accessCode.toUpperCase())
    .first<RecordRow>();
  return result ?? null;
};

const getRecordById = async (db: D1Database, id: string) => {
  const result = await db
    .prepare("SELECT * FROM assessment_records WHERE id = ?1 LIMIT 1")
    .bind(id)
    .first<RecordRow>();
  return result ?? null;
};

const toBase64Url = (input: Uint8Array | string) => {
  const source =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  source.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
};

const signMessage = async (secret: string, message: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return toBase64Url(new Uint8Array(signature));
};

const createAdminToken = async (secret: string) => {
  const payload = JSON.stringify({
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  const encodedPayload = toBase64Url(payload);
  const signature = await signMessage(secret, encodedPayload);
  return `${encodedPayload}.${signature}`;
};

const verifyAdminToken = async (
  authorization: string | null,
  secret: string,
) => {
  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }
  const token = authorization.slice("Bearer ".length);
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) {
    return false;
  }
  const expectedSignature = await signMessage(secret, payloadPart);
  if (expectedSignature !== signature) {
    return false;
  }
  const payload = JSON.parse(fromBase64Url(payloadPart)) as { exp: number };
  return payload.exp > Date.now();
};

const ensureAdmin = async (request: Request, env: AppEnv) => {
  const ok = await verifyAdminToken(
    request.headers.get("Authorization"),
    env.SESSION_SECRET,
  );
  if (!ok) {
    throw new Response("Unauthorized", { status: 401 });
  }
};

const handleCreateRecord = async (env: AppEnv) => {
  const now = new Date().toISOString();
  let accessCode = makeAccessCode();

  for (let index = 0; index < 10; index += 1) {
    const existing = await getRecordByAccessCode(env.DB, accessCode);
    if (!existing) {
      break;
    }
    accessCode = makeAccessCode();
  }

  const record = {
    id: crypto.randomUUID(),
    accessCode,
    ownerLabel: env.OWNER_LABEL || "AI 提分叶路春",
    createdAt: now,
    updatedAt: now,
    profile: emptyProfile(),
    sections: emptySections(),
    completion: emptyCompletion(),
  } satisfies PublicRecord;

  await env.DB.prepare(
    `INSERT INTO assessment_records (
      id, access_code, owner_label, subject_scores_json, profile_json, sections_json, completion_json, created_at, updated_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
  )
    .bind(
      record.id,
      record.accessCode,
      record.ownerLabel,
      JSON.stringify(record.profile.subjectScores),
      JSON.stringify(record.profile),
      JSON.stringify(record.sections),
      JSON.stringify(record.completion),
      record.createdAt,
      record.updatedAt,
    )
    .run();

  return json({ record });
};

const handleSaveProfile = async (env: AppEnv, accessCode: string, request: Request) => {
  const existing = await getRecordByAccessCode(env.DB, accessCode);
  if (!existing) {
    return text("Record not found", 404);
  }

  const body = await parseJson<{ profile: Partial<StudentProfile> }>(request);
  const record = rowToRecord(existing);
  const nextProfile = mergeProfile({
    ...record.profile,
    ...body.profile,
    subjectScores: {
      ...record.profile.subjectScores,
      ...(body.profile.subjectScores ?? {}),
    },
  });
  const nextCompletion = {
    ...record.completion,
    profile: profileIsComplete(nextProfile),
  };
  const updatedAt = new Date().toISOString();

  await env.DB.prepare(
    `UPDATE assessment_records
      SET student_name = ?1,
          school_name = ?2,
          grade = ?3,
          gender = ?4,
          guardian_name = ?5,
          guardian_role = ?6,
          subject_scores_json = ?7,
          score_notes = ?8,
          profile_json = ?9,
          completion_json = ?10,
          updated_at = ?11
      WHERE access_code = ?12`,
  )
    .bind(
      nextProfile.studentName,
      nextProfile.schoolName,
      nextProfile.grade,
      nextProfile.gender,
      nextProfile.guardianName,
      nextProfile.guardianRole,
      JSON.stringify(nextProfile.subjectScores),
      nextProfile.scoreNotes,
      JSON.stringify(nextProfile),
      JSON.stringify(nextCompletion),
      updatedAt,
      accessCode.toUpperCase(),
    )
    .run();

  return json({
    record: {
      ...record,
      profile: nextProfile,
      completion: nextCompletion,
      updatedAt,
    },
  });
};

const handleSaveSurvey = async (
  env: AppEnv,
  accessCode: string,
  surveyKey: SurveyKey,
  request: Request,
) => {
  const existing = await getRecordByAccessCode(env.DB, accessCode);
  if (!existing) {
    return text("Record not found", 404);
  }

  const body = await parseJson<{ answers: Record<string, string>; completed: boolean }>(
    request,
  );
  const record = rowToRecord(existing);
  const updatedAt = new Date().toISOString();
  const nextSections = hydrateSections(record.sections);
  nextSections[surveyKey] = {
    answers: body.answers ?? {},
    completed: body.completed,
    updatedAt,
    completedAt: body.completed ? updatedAt : nextSections[surveyKey].completedAt,
  };
  const nextCompletion = {
    ...record.completion,
    [surveyKey]: body.completed,
  };

  await env.DB.prepare(
    `UPDATE assessment_records
      SET sections_json = ?1,
          completion_json = ?2,
          updated_at = ?3
      WHERE access_code = ?4`,
  )
    .bind(
      JSON.stringify(nextSections),
      JSON.stringify(nextCompletion),
      updatedAt,
      accessCode.toUpperCase(),
    )
    .run();

  return json({
    record: {
      ...record,
      sections: nextSections,
      completion: nextCompletion,
      updatedAt,
    },
  });
};

const serveSpaAsset = async (request: Request, env: AppEnv) => {
  const url = new URL(request.url);
  if (url.pathname === "/" || !url.pathname.includes(".")) {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = "/";
    return env.ASSETS.fetch(new Request(assetUrl, request));
  }
  return env.ASSETS.fetch(request);
};

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      if (request.method === "POST" && pathname === "/api/admin/login") {
        const body = await parseJson<{ password: string }>(request);
        if (body.password !== env.ADMIN_PASSWORD) {
          return text("Invalid password", 401);
        }
        return json({ token: await createAdminToken(env.SESSION_SECRET) });
      }

      if (pathname.startsWith("/api/admin/")) {
        await ensureAdmin(request, env);

        if (request.method === "GET" && pathname === "/api/admin/records") {
          const results = await env.DB.prepare(
            "SELECT * FROM assessment_records ORDER BY updated_at DESC",
          ).all<RecordRow>();
          const records = (results.results ?? []).map((row) =>
            recordToListItem(rowToRecord(row)),
          );
          return json({ records });
        }

        if (request.method === "GET" && pathname === "/api/admin/export.csv") {
          const results = await env.DB.prepare(
            "SELECT * FROM assessment_records ORDER BY updated_at DESC",
          ).all<RecordRow>();
          const rows = (results.results ?? []).map((row) => rowToRecord(row));
          const answerHeaders = SURVEY_CATALOG.surveys.flatMap((survey) =>
            survey.questions.map(
              (question, index) =>
                `${surveyKeyLabel(survey.key)}_Q${String(index + 1).padStart(2, "0")}_${question.prompt}`,
            ),
          );
          const header = [
            "内部编号",
            "归属",
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
            "档案完成",
            "学生MBTI完成",
            "学习动力完成",
            "VARK完成",
            "学习认知完成",
            "家长MBTI完成",
            "创建时间",
            "更新时间",
            ...answerHeaders,
          ];
          const csvRows = rows.map((record) => {
            const answerColumns = flattenAnswerColumns(record).map((column) => column.value);
            return [
              record.accessCode,
              record.ownerLabel,
              record.profile.studentName,
              record.profile.schoolName,
              record.profile.grade,
              record.profile.gender,
              record.profile.guardianName,
              record.profile.guardianRole,
              record.profile.subjectScores.chinese,
              record.profile.subjectScores.math,
              record.profile.subjectScores.english,
              record.profile.subjectScores.physics,
              record.profile.subjectScores.chemistry,
              record.profile.subjectScores.biology,
              record.profile.subjectScores.politics,
              record.profile.subjectScores.history,
              record.profile.subjectScores.geography,
              record.profile.scoreNotes,
              String(record.completion.profile),
              String(record.completion.studentMbti),
              String(record.completion.learningMotivation),
              String(record.completion.vark),
              String(record.completion.cognition),
              String(record.completion.guardianMbti),
              record.createdAt,
              record.updatedAt,
              ...answerColumns,
            ]
              .map(csvEscape)
              .join(",");
          });
          return text(`\uFEFF${[header.map(csvEscape).join(","), ...csvRows].join("\n")}`, 200, {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="assessment-records.csv"',
          });
        }

        const recordExportMatch = pathname.match(/^\/api\/admin\/records\/([^/]+)\/export\.json$/);
        if (request.method === "GET" && recordExportMatch) {
          const recordId = decodeURIComponent(recordExportMatch[1]);
          const row = await getRecordById(env.DB, recordId);
          if (!row) {
            return text("Record not found", 404);
          }
          const record = rowToRecord(row);
          const filename = `${record.profile.studentName || record.accessCode}-assessment.json`;
          return json(buildSingleRecordExport(record), 200, {
            "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
          });
        }

        const recordIdMatch = pathname.match(/^\/api\/admin\/records\/([^/]+)$/);
        if (request.method === "DELETE" && recordIdMatch) {
          const recordId = decodeURIComponent(recordIdMatch[1]);
          const existing = await getRecordById(env.DB, recordId);
          if (!existing) {
            return text("Record not found", 404);
          }
          await env.DB.prepare("DELETE FROM assessment_records WHERE id = ?1")
            .bind(recordId)
            .run();
          return json({ ok: true });
        }

        if (request.method === "GET" && recordIdMatch) {
          const row = await getRecordById(env.DB, decodeURIComponent(recordIdMatch[1]));
          if (!row) {
            return text("Record not found", 404);
          }
          return json({ record: { ...recordToListItem(rowToRecord(row)), ...rowToRecord(row) } });
        }
      }

      if (request.method === "POST" && pathname === "/api/public/records") {
        return await handleCreateRecord(env);
      }

      const profileMatch = pathname.match(/^\/api\/public\/records\/([^/]+)\/profile$/);
      if (request.method === "POST" && profileMatch) {
        return await handleSaveProfile(env, decodeURIComponent(profileMatch[1]), request);
      }

      const surveyMatch = pathname.match(
        /^\/api\/public\/records\/([^/]+)\/surveys\/([^/]+)$/,
      );
      if (request.method === "POST" && surveyMatch) {
        const surveyKey = decodeURIComponent(surveyMatch[2]) as SurveyKey;
        if (!surveyKeys.includes(surveyKey)) {
          return text("Unknown survey", 400);
        }
        return await handleSaveSurvey(
          env,
          decodeURIComponent(surveyMatch[1]),
          surveyKey,
          request,
        );
      }

      const recordMatch = pathname.match(/^\/api\/public\/records\/([^/]+)$/);
      if (request.method === "GET" && recordMatch) {
        const row = await getRecordByAccessCode(env.DB, decodeURIComponent(recordMatch[1]));
        if (!row) {
          return text("Record not found", 404);
        }
        return json({ record: rowToRecord(row) });
      }

      if (pathname.startsWith("/api/")) {
        return text("Not found", 404);
      }

      return await serveSpaAsset(request, env);
    } catch (error) {
      if (error instanceof Response) {
        return error;
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      return text(message, 500);
    }
  },
} satisfies ExportedHandler<AppEnv>;
