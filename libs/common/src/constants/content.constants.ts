export const CONTENT_COMMANDS = {
  // ── Category ─────────────────────────────────────────────────────────────────
  GET_CATEGORIES: 'get_categories',
  GET_CATEGORY_BY_ID: 'get_category_by_id',
  GET_TOTAL_EXERCISES_PER_CATEGORY: 'get_total_exercises_per_category',
  // Trả về { type, totalPacks, totalExercises } × 3 types — mẫu số cho Section 1
  GET_CATEGORIES_CONTENT_SUMMARY: 'get_categories_content_summary',

  // ── Level ─────────────────────────────────────────────────────────────────────
  GET_LEVELS: 'get_levels',
  GET_LEVEL_BY_ID: 'get_level_by_id',
  // Đếm totalExercises trong level × categoryType — mẫu số cho Section 2
  GET_TOTAL_EXERCISES_PER_LEVEL: 'get_total_exercises_per_level',

  // ── LessonPack ────────────────────────────────────────────────────────────────
  // List packs có filter (categoryId | levelId | categoryType | status)
  // Dùng cho màn "Xem tất cả" bài học trong level
  GET_PACKS: 'get_packs',

  // Chi tiết 1 pack — dùng khi user bấm play
  GET_PACK_BY_ID: 'get_pack_by_id',

  // Batch fetch nhiều packs theo IDs (max 50)
  // Dùng cho Section 4: user-service trả packIds → content-service trả pack info
  // Thứ tự response giữ nguyên thứ tự ids truyền vào
  GET_PACKS_BY_IDS: 'get_packs_by_ids',

  // Đếm totalPacks + totalExercises trong category × level — mẫu số cho Section 3
  // completionPercent = completedPacks / totalPacks × 100
  GET_PACK_STATS_BY_CATEGORY_AND_LEVEL: 'get_pack_stats_by_category_and_level',

  // Lấy tất cả exercises trong 1 pack — dùng khi bắt đầu làm bài
  GET_PACK_EXERCISES: 'get_pack_exercises',

  // ── Pack Attempt ───────────────────────────────────────────────────────────
  // User bấm "Bắt đầu" → tạo PackAttempt + N ExerciseAttempt (PENDING)
  // TODO: logic trừ credit sẽ nằm ở đây sau
  START_PACK_ATTEMPT: 'start_pack_attempt',

  // ── ExerciseAttempt ───────────────────────────────────────────────────────
  // Tầng 1: FE submit audioId sau khi upload xong → content-svc gọi ai-svc transcribe
  SUBMIT_EXERCISE_ATTEMPT_AUDIO: 'submit_exercise_attempt_audio',

  // ── Pack Scoring ──────────────────────────────────────────────────────────
  // Tầng 2: FE yêu cầu AI chấm điểm toàn pack (sau khi hoàn thành pack)
  SCORE_PACK_ATTEMPT: 'score_pack_attempt',
  // Lấy kết quả scoring đã lưu (nếu đã chấm trước đó)
  GET_PACK_SCORING: 'get_pack_scoring',
};
