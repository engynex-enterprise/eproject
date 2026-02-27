// ─── Base / Utility Types ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, string[]>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  provider: 'local' | 'google' | 'github';
  language: string;
  theme: string;
  accentColor: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Organization ────────────────────────────────────────────────────────────

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  ownerId: number;
  ssoEnabled: boolean;
  ssoProvider: string | null;
  ssoConfig: Record<string, unknown> | null;
  maxMembers: number | null;
  maxProjects: number | null;
  storageLimit: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: number;
  organizationId: number;
  userId: number;
  roleId: number;
  user: User;
  role: Role;
  joinedAt: string;
  isActive: boolean;
}

// ─── Role & Permission ───────────────────────────────────────────────────────

export interface Role {
  id: number;
  name: string;
  description: string | null;
  organizationId: number | null;
  isSystem: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

// ─── Project ─────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  name: string;
  key: string;
  description: string | null;
  organizationId: number;
  leadId: number | null;
  lead: User | null;
  iconUrl: string | null;
  color: string | null;
  isArchived: boolean;
  defaultAssigneeId: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Space ───────────────────────────────────────────────────────────────────

export interface Space {
  id: number;
  name: string;
  description: string | null;
  projectId: number;
  color: string | null;
  icon: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Sprint ──────────────────────────────────────────────────────────────────

export interface Sprint {
  id: number;
  name: string;
  goal: string | null;
  projectId: number;
  startDate: string | null;
  endDate: string | null;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Version ─────────────────────────────────────────────────────────────────

export interface Version {
  id: number;
  name: string;
  description: string | null;
  projectId: number;
  releaseDate: string | null;
  isReleased: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Issue Types, Statuses, Priorities ───────────────────────────────────────

export type StatusGroupType = 'todo' | 'in_progress' | 'done' | 'cancelled';

export interface StatusGroup {
  id: number;
  name: string;
  type: StatusGroupType;
  color: string;
}

export interface Status {
  id: number;
  name: string;
  description: string | null;
  projectId: number;
  statusGroupId: number;
  statusGroup: StatusGroup;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssueType {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  projectId: number | null;
  isSubtask: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PriorityLevel = 'highest' | 'high' | 'medium' | 'low' | 'lowest';

export interface Priority {
  id: number;
  name: string;
  level: PriorityLevel;
  icon: string;
  color: string;
  order: number;
}

// ─── Issue ───────────────────────────────────────────────────────────────────

export interface Issue {
  id: number;
  title: string;
  description: string | null;
  projectId: number;
  issueTypeId: number;
  issueType: IssueType;
  statusId: number;
  status: Status;
  priorityId: number | null;
  priority: Priority | null;
  assigneeId: number | null;
  assignee: User | null;
  reporterId: number;
  reporter: User;
  parentId: number | null;
  sprintId: number | null;
  sprint: Sprint | null;
  versionId: number | null;
  version: Version | null;
  spaceId: number | null;
  space: Space | null;
  storyPoints: number | null;
  startDate: string | null;
  dueDate: string | null;
  issueKey: string;
  order: number;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

// ─── Comment ─────────────────────────────────────────────────────────────────

export interface Comment {
  id: number;
  content: string;
  issueId: number;
  authorId: number;
  author: User;
  parentId: number | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Attachment ──────────────────────────────────────────────────────────────

export interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  issueId: number;
  uploadedById: number;
  uploadedBy: User;
  createdAt: string;
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

export interface Tag {
  id: number;
  name: string;
  color: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Board ───────────────────────────────────────────────────────────────────

export interface Board {
  id: number;
  name: string;
  projectId: number;
  type: 'kanban' | 'scrum';
  columns: BoardColumn[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: number;
  boardId: number;
  statusId: number;
  status: Status;
  order: number;
  wipLimit: number | null;
}

// ─── Workflow ────────────────────────────────────────────────────────────────

export interface Workflow {
  id: number;
  name: string;
  description: string | null;
  projectId: number;
  isDefault: boolean;
  transitions: WorkflowTransition[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTransition {
  id: number;
  workflowId: number;
  fromStatusId: number;
  toStatusId: number;
  fromStatus: Status;
  toStatus: Status;
  name: string | null;
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationPreference {
  id: number;
  userId: number;
  organizationId: number | null;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  issueAssigned: boolean;
  issueUpdated: boolean;
  issueCommented: boolean;
  sprintStarted: boolean;
  sprintCompleted: boolean;
  mentionedInComment: boolean;
}
