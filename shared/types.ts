export enum TemplateCategory {
  INJECTION = 'injection',
  SKIN = 'skin',
  PLASTIC = 'plastic',
  ANTI_AGING = 'anti_aging',
}

export enum TemplateStatus {
  DRAFT = 'draft',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

export enum SectionType {
  INTRODUCTION = 'introduction',
  CONTRAINDICATION = 'contraindication',
  ALTERNATIVE = 'alternative',
  POST_CARE = 'post_care',
  DISPUTE = 'dispute',
  CUSTOM = 'custom',
}

export enum UserRole {
  LEGAL_OFFICER = 'legal_officer',
  MEDICAL_DIRECTOR = 'medical_director',
  STORE_MANAGER = 'store_manager',
}

export enum ReviewDecision {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export interface User {
  id: string;
  username: string;
  realName: string;
  role: UserRole;
  department: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  status: TemplateStatus;
  currentVersion: string;
  latestVersionId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: string;
  changeNote: string;
  sections: TemplateSection[];
  createdAt: string;
  createdBy: string;
}

export interface TemplateSection {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  order: number;
  isRiskHighlight: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface MedicalProject {
  id: string;
  code: string;
  name: string;
  category: TemplateCategory;
  parentId?: string;
  sort: number;
}

export interface ProjectTemplateMapping {
  id: string;
  projectId: string;
  templateId: string;
  templateVersionId: string;
  populationType: 'adult' | 'minor' | 'secondary' | 'custom';
  populationLabel: string;
  isDefault: boolean;
  minAge?: number;
  maxAge?: number;
  requiredPriorTreatmentCount?: number;
}

export interface ReviewRecord {
  id: string;
  templateVersionId: string;
  templateId: string;
  submitterId: string;
  submitterName: string;
  submittedAt: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  decision?: ReviewDecision;
  reviewComment?: string;
  changeSummary: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Store {
  id: string;
  name: string;
  code: string;
  city: string;
  province: string;
  region: 'north' | 'east' | 'south' | 'west' | 'central';
  isActive: boolean;
}

export interface DeployRecord {
  id: string;
  templateVersionId: string;
  templateId: string;
  storeIds: string[];
  cityNames: string[];
  deployType: 'immediate' | 'scheduled';
  scheduledAt?: string;
  effectiveAt: string;
  status: 'active' | 'revoked';
  revokedAt?: string;
  publishedBy: string;
  versionNote: string;
  forceReadingMinutes?: number;
}

export interface SectionMetric {
  sectionId: string;
  sectionTitle: string;
  dwellTimeSeconds: number;
  revisitCount: number;
  scrollDepthPercent: number;
}

export interface ConfirmationAction {
  id: string;
  type: 'read' | 'explain' | 'confirm' | 'sign';
  label: string;
  timestamp: string;
  operator: string;
}

export interface SignatureRecord {
  id: string;
  customerName: string;
  customerIdCardMasked: string;
  projectId: string;
  projectName: string;
  templateId: string;
  templateVersionId: string;
  templateVersion: string;
  storeId: string;
  storeName: string;
  advisorName: string;
  signedAt: string;
  isResign: boolean;
  resignReason?: string;
  sectionMetrics: SectionMetric[];
  confirmationActions: ConfirmationAction[];
  signatureUrl: string;
  hasComplaint: boolean;
}

export interface RiskStats {
  totalSignatures30d: number;
  resignRate: number;
  avgReadingSeconds: number;
  complaintCount: number;
  signatureTrend: { date: string; count: number }[];
  topRiskSections: {
    sectionTitle: string;
    templateName: string;
    avgDwellSeconds: number;
    revisitCount: number;
    dropOffRate: number;
  }[];
  resignByProject: {
    projectName: string;
    totalCount: number;
    resignCount: number;
    resignRate: number;
  }[];
  complaintAnalysis: {
    projectName: string;
    templateVersion: string;
    relatedSections: string[];
    count: number;
  }[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PagedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
