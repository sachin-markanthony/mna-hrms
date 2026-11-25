export class UpdateChapterProgressDto {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED';
  progressPercentage?: number;
}
