import { ASSESSMENT_ANSWER_KEY } from '../data/assessmentKey';
import { getLearnerAssessment } from '../data/assessmentBank';
import { getPassingMark, INDUCTION_CONFIG } from '../config/induction.config';

export interface GradeAssessmentRequest {
  employeeId: string;
  chapterId: string;
  chapterNumber: number;
  answers: Record<string, string>;
}

export interface GradeAssessmentResponse {
  correctCount: number;
  total: number;
  score: number;
  passed: boolean;
  passingPercentage: number;
  passingMark: number;
  missedQuestionIds: string[];
}

/**
 * MOCK SERVER BOUNDARY.
 *
 * This function stands in for `POST /induction/chapters/:id/assessment/attempts`
 * on the NestJS API. It is the only module that reads the answer key. The UI
 * receives a result summary only — never the correct options.
 *
 * Before production, delete `data/assessmentKey.ts` and replace this function
 * with an authenticated HTTP call. The backend must also enforce the sequential
 * unlock rule and the 80% pass mark.
 */
export async function gradeAssessment(
  request: GradeAssessmentRequest,
): Promise<GradeAssessmentResponse> {
  // Simulate a short network round-trip so the UI can show a submitting state.
  await new Promise((resolve) => window.setTimeout(resolve, 450));

  const assessment = getLearnerAssessment(request.chapterNumber);
  const answerKey = ASSESSMENT_ANSWER_KEY[request.chapterNumber];

  if (!assessment || !answerKey) {
    throw new Error('This assessment has not been configured yet.');
  }

  if (assessment.questions.length === 0) {
    throw new Error('This assessment has no questions configured yet.');
  }

  const unanswered = assessment.questions.filter((question) => {
    const answer = request.answers[question.id];
    return !question.options.some((option) => option.key === answer);
  });

  if (unanswered.length > 0) {
    throw new Error('Answer every question before submitting the assessment.');
  }

  const missedQuestionIds = assessment.questions
    .filter((question) => request.answers[question.id] !== answerKey[question.id])
    .map((question) => question.id);

  const total = assessment.questions.length;
  const correctCount = total - missedQuestionIds.length;
  const score = Math.round((correctCount / total) * 100);
  const passingMark = getPassingMark(total);
  const passed = score >= INDUCTION_CONFIG.passingPercentage;

  return {
    correctCount,
    total,
    score,
    passed,
    passingPercentage: INDUCTION_CONFIG.passingPercentage,
    passingMark,
    missedQuestionIds,
  };
}
