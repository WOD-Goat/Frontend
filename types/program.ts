// Program Types (athlete-facing subset — coach/admin management happens in CoachDashboard web)
import type { ResultData, WODData } from "./workout";
import type { VideoLibraryEntry } from "./group";

export interface Program {
  id: string;
  name: string;
  description?: string | null;
  durationDays: number;
  createdBy?: string;
  adminIds?: string[];
  joinCode?: string;
  createdAt?: Date;
  isAdmin?: boolean;
}

export interface ProgramResponse {
  success: boolean;
  data: Program;
  message?: string;
}

// Row shape returned by GET /api/programs/member-programs (Groups-tab list, joined programs)
export interface MemberProgram {
  id: string;
  name: string;
  description?: string | null;
  durationDays: number;
  startDate: Date;
  currentDayNumber: number;
  isComplete: boolean;
}

export interface MemberProgramsResponse {
  success: boolean;
  data: MemberProgram[];
  message?: string;
}

export interface ProgramLookup {
  id: string;
  name: string;
  description?: string | null;
  durationDays: number;
}

export interface ProgramLookupResponse {
  success: boolean;
  data: ProgramLookup;
  message?: string;
}

// Result of POST /api/join/resolve — Group codes join immediately,
// Program codes only preview (client still picks a start date before
// actually joining via POST /api/programs/join)
export type ResolveJoinCode =
  | { type: "group"; groupId: string; groupName: string }
  | { type: "program"; id: string; name: string; description?: string | null; durationDays: number };

export interface ResolveJoinCodeResponse {
  success: boolean;
  data: ResolveJoinCode;
  message?: string;
}

export interface ProgramWorkout {
  id: string;
  programId: string;
  dayNumber: number; // 1-based. week = ceil(dayNumber/7), weekday = ((dayNumber-1)%7)+1
  title?: string | null;
  notes?: string | null;
  wodType?: "structured" | "raw";
  wods: WODData[];
  referenceLinks?: VideoLibraryEntry[];
  createdBy?: string;
  createdAt?: Date;
  hasSubmitted?: boolean;
  userResult?: {
    userId: string;
    userName: string;
    submittedAt: Date;
    results: ResultData[];
    comment?: string | null;
  } | null;
}

export interface ProgramWorkoutResponse {
  success: boolean;
  data: ProgramWorkout;
  message?: string;
}

export interface ProgramWorkoutsResponse {
  success: boolean;
  count: number;
  data: ProgramWorkout[];
  currentDayNumber?: number;
  message?: string;
}
