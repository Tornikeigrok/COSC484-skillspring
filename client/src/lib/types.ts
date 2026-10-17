export type Role = 'student' | 'company';
export interface User {
  id: string;
  email?: string;
  first_name: string;
  last_name: string;
  role: Role;
}
export type Verification = 'unverified' | 'pending' | 'verified' | 'rejected';
export interface Company {
  id: string;
  user?: string;
  name: string;
  description: string;
  website: string;
  verification_status: Verification;
}
export interface Profile extends Partial<Company> {
  id: string;
  user: string;
  bio?: string;
  university?: string;
  github_url?: string;
  graduation_year?: number;
  skills?: string[];
  verification_status: Verification;
}
export type TaskStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'submitted'
  | 'changes_requested'
  | 'validation_failed'
  | 'completed'
  | 'rejected'
  | 'closed';
export interface Task {
  id: string;
  owner: string;
  company: Company;
  title: string;
  description: string;
  acceptance_criteria: string;
  category: string;
  difficulty: string;
  skills: string[];
  estimated_hours: number;
  status: TaskStatus;
  agreement_required: boolean;
  createdAt: string;
}
export interface Proposal {
  id: string;
  task: Task;
  student: User;
  message: string;
  estimated_hours: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
export interface Assignment {
  id: string;
  task: Task;
  student: User;
  owner: string;
  status: 'awaiting_agreement' | Exclude<TaskStatus, 'open' | 'assigned' | 'closed'>;
  latest_submission?: string;
  submission_count: number;
  createdAt: string;
}
export interface Agreement {
  id: string;
  text: string;
  version: 1;
  accepted_at?: string;
  accepted_name?: string;
}
export interface FileAsset {
  id: string;
  filename: string;
  size: number;
  sha256: string;
}
export interface Submission {
  id: string;
  assignment: string;
  file: FileAsset;
  notes: string;
  version: number;
  createdAt: string;
}
export interface Review {
  id: string;
  submission: string;
  decision: 'approved' | 'changes_requested' | 'rejected';
  feedback: string;
  rating?: number;
  createdAt: string;
}
export interface ValidationRun {
  id: string;
  submission: string;
  status: 'passed' | 'failed';
  findings: string[];
  file_count: number;
  uncompressed_bytes: number;
  execution: 'not_run';
}
export interface Experience {
  id: string;
  title: string;
  summary: string;
  skills: string[];
  company: Company;
  rating: number;
  completed_at: string;
}
export interface ProfileResponse {
  user: User;
  profile: Profile;
  experiences: Experience[];
}
export interface AssignmentDetail {
  assignment: Assignment;
  agreement: Agreement | null;
  files: FileAsset[];
  submissions: Submission[];
  reviews: Review[];
  validations: ValidationRun[];
}
export interface TaskList {
  items: Task[];
  total: number;
  page: number;
  pages: number;
}
export const categories: Record<string, string> = {
  ui: 'UI / UX',
  api: 'API',
  data: 'Data',
  component: 'Component',
  script: 'Script',
  poc: 'Proof of concept',
};
export const fullName = (user: Pick<User, 'first_name' | 'last_name'>) =>
  `${user.first_name} ${user.last_name}`;
