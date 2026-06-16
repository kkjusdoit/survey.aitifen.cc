export type SurveyKey =
  | "studentMbti"
  | "learningMotivation"
  | "vark"
  | "cognition"
  | "guardianMbti";

export type Audience = "student" | "guardian";

export interface SurveyOption {
  id: string;
  label: string;
  trait?: string;
}

export interface SurveyQuestion {
  id: string;
  sourceQuestionId: string;
  prompt: string;
  options: SurveyOption[];
}

export interface SurveyDefinition {
  key: SurveyKey;
  title: string;
  shortTitle: string;
  audience: Audience;
  intro: string;
  sourceTitle: string;
  sourceUrl: string;
  questions: SurveyQuestion[];
}

export interface ProfileCatalog {
  gradeOptions: string[];
  genderOptions: string[];
  guardianRoleOptions: string[];
  subjectFields: Array<{ key: SubjectKey; label: string }>;
}

export interface SurveyCatalog {
  ownerLabel: string;
  sourceNotes: string[];
  profile: ProfileCatalog;
  surveys: SurveyDefinition[];
}

export type SubjectKey =
  | "chinese"
  | "math"
  | "english"
  | "physics"
  | "chemistry"
  | "biology"
  | "politics"
  | "history"
  | "geography";

export type SubjectScores = Record<SubjectKey, string>;

export interface StudentProfile {
  studentName: string;
  schoolName: string;
  grade: string;
  gender: string;
  guardianName: string;
  guardianRole: string;
  subjectScores: SubjectScores;
  scoreNotes: string;
}

export type AnswerMap = Record<string, string>;

export interface SurveySectionState {
  answers: AnswerMap;
  completed: boolean;
  updatedAt: string | null;
  completedAt: string | null;
}

export type SurveySections = Record<SurveyKey, SurveySectionState>;

export interface CompletionState extends Record<SurveyKey, boolean> {
  profile: boolean;
}

export interface PublicRecord {
  id: string;
  accessCode: string;
  ownerLabel: string;
  createdAt: string;
  updatedAt: string;
  profile: StudentProfile;
  sections: SurveySections;
  completion: CompletionState;
}

export interface AdminListItem {
  id: string;
  accessCode: string;
  ownerLabel: string;
  studentName: string;
  schoolName: string;
  grade: string;
  guardianName: string;
  guardianRole: string;
  createdAt: string;
  updatedAt: string;
  completion: CompletionState;
}

export interface AdminDetail extends AdminListItem {
  profile: StudentProfile;
  sections: SurveySections;
}
