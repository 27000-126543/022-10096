import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type User,
  type Template,
  type TemplateParagraph,
  type TemplateVersion,
  type Project,
  type ReviewRecord,
  type Store,
  type DeployRecord,
  type SignatureRecord,
  type RiskTermStats,
  type ReSignStats,
  type ComplaintAssociation,
  type AnalyticsSummary,
  users as initUsers,
  templates as initTemplates,
  projects as initProjects,
  reviewRecords as initReviews,
  stores as initStores,
  deployRecords as initDeploys,
  signatureRecords as initSignatures,
  riskTermStats as initRiskTermStats,
  resignStats as initResignStats,
  complaintAssociations as initComplaintAssociations,
  analyticsSummary as initAnalyticsSummary,
} from '@/data/localMock';

export type ProjectMappingConfig = {
  id: string;
  populationType: 'adult' | 'minor' | 'retreatment' | 'custom';
  populationLabel: string;
  templateId: string;
  versionId: string;
  version: string;
  isDefault: boolean;
  minAge?: number;
  maxAge?: number;
  priorTreatmentCount?: number;
};

export type ActivityLogType = 'draft_saved' | 'submitted' | 'approved' | 'rejected' | 'deployed' | 'withdrawn';

export interface TemplateActivityLog {
  id: string;
  templateId: string;
  versionId?: string;
  version?: string;
  type: ActivityLogType;
  typeLabel: string;
  operatorId: string;
  operatorName: string;
  description: string;
  timestamp: string;
  reviewId?: string;
  deployId?: string;
}

function hashSignatureId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function signatureHasComplaint(signatureId: string): boolean {
  return hashSignatureId(signatureId) % 15 === 0;
}

export interface ComplaintDetail {
  complaintId: string;
  complaintType: string;
  complaintTime: string;
  handleStatus: 'processing' | 'closed';
  handleStatusLabel: string;
  riskTerms: string[];
}

const complaintTypes = ['皮肤过敏', '效果不佳', '服务态度', '收费争议', '其他'];

export function getComplaintDetail(signatureId: string, signedAt: string, paragraphReadings: { paragraphId: string; paragraphTitle: string; duration: number }[]): ComplaintDetail | null {
  if (!signatureHasComplaint(signatureId)) {
    return null;
  }

  const hash = hashSignatureId(signatureId);
  const typeIndex = hash % complaintTypes.length;
  const daysAfter = 7 + (hash % 24);
  const statusIndex = hash % 2;

  const signedDate = new Date(signedAt);
  const complaintDate = new Date(signedDate.getTime() + daysAfter * 24 * 60 * 60 * 1000);

  const sortedByDuration = [...paragraphReadings].sort((a, b) => b.duration - a.duration);
  const riskTerms = sortedByDuration.slice(0, 2 + (hash % 2)).map(p => p.paragraphTitle);

  return {
    complaintId: `TS-2024-${String(hash % 10000).padStart(4, '0')}`,
    complaintType: complaintTypes[typeIndex],
    complaintTime: complaintDate.toISOString(),
    handleStatus: statusIndex === 0 ? 'processing' : 'closed',
    handleStatusLabel: statusIndex === 0 ? '处理中' : '已结案',
    riskTerms,
  };
}

interface DataState {
  users: User[];
  templates: Template[];
  projects: Project[];
  projectMappings: Record<string, ProjectMappingConfig[]>;
  reviews: ReviewRecord[];
  stores: Store[];
  deploys: DeployRecord[];
  signatures: SignatureRecord[];
  templateActivityLogs: TemplateActivityLog[];
  riskTermStats: RiskTermStats[];
  resignStats: ReSignStats[];
  complaintAssociations: ComplaintAssociation[];
  analyticsSummary: AnalyticsSummary;

  saveTemplateDraft: (templateId: string, versionId: string, updates: {
    name?: string;
    paragraphs?: TemplateParagraph[];
    changeLog?: string;
    operatorId?: string;
    operatorName?: string;
  }) => void;

  submitTemplateForReview: (
    templateId: string,
    versionId: string,
    submitterId: string,
    submitterName: string,
    changeSummary: string
  ) => ReviewRecord | null;

  processReview: (
    reviewId: string,
    decision: 'approved' | 'rejected',
    reviewerId: string,
    reviewerName: string,
    opinion: string
  ) => void;

  saveProjectMappings: (projectId: string, mappings: ProjectMappingConfig[]) => void;

  createDeployRecord: (deploy: Omit<DeployRecord, 'id' | 'deployedAt'> & {
    operatorId?: string;
    operatorName?: string;
  }) => void;

  withdrawDeploy: (deployId: string, operatorId?: string, operatorName?: string) => void;

  getSignatureById: (id: string) => SignatureRecord | undefined;

  getTemplateActivityLogs: (templateId: string) => TemplateActivityLog[];

  getReviewActivityLogs: (reviewId: string) => TemplateActivityLog[];

  getDeployById: (id: string) => DeployRecord | undefined;

  getComplaintSignatures: () => SignatureRecord[];

  getSignaturesByParagraphId: (paragraphId: string) => SignatureRecord[];

  resetToInitial: () => void;
}

const generateId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const initProjectMappings: Record<string, ProjectMappingConfig[]> = {};
const seedProjectsForMapping = initProjects.filter(p => p.level === 2 || (p.level === 1 && !initProjects.some(c => c.parentId === p.id)));
seedProjectsForMapping.slice(0, 10).forEach(p => {
  const tpl = initTemplates.find(t => t.category === p.categoryId);
  if (tpl) {
    const publishedVersion = tpl.versions.find(v => v.isPublished) || tpl.versions[0];
    initProjectMappings[p.id] = [
      {
        id: generateId('pm'),
        populationType: 'adult',
        populationLabel: '成人版',
        templateId: tpl.id,
        versionId: publishedVersion.id,
        version: publishedVersion.version,
        isDefault: true,
        minAge: 18,
        maxAge: 65,
      },
    ];
  }
});

const initActivityLogs: TemplateActivityLog[] = [];
initTemplates.forEach(t => {
  const publishedVersion = t.versions.find(v => v.isPublished);
  if (publishedVersion) {
    initActivityLogs.push({
      id: generateId('log'),
      templateId: t.id,
      versionId: publishedVersion.id,
      version: publishedVersion.version,
      type: 'draft_saved',
      typeLabel: '草稿创建',
      operatorId: t.createdBy,
      operatorName: '李晓明',
      description: `创建模板《${t.name}》初始版本 v${publishedVersion.version}`,
      timestamp: t.createdAt,
    });
    if (t.status === 'approved' || t.status === 'published') {
      initActivityLogs.push({
        id: generateId('log'),
        templateId: t.id,
        versionId: publishedVersion.id,
        version: publishedVersion.version,
        type: 'submitted',
        typeLabel: '提交审核',
        operatorId: t.createdBy,
        operatorName: '李晓明',
        description: `提交 v${publishedVersion.version} 版本审核，变更说明：${publishedVersion.changeLog || '完善风险条款描述'}`,
        timestamp: new Date(new Date(t.updatedAt).getTime() - 3600000 * 2).toISOString(),
      });
      initActivityLogs.push({
        id: generateId('log'),
        templateId: t.id,
        versionId: publishedVersion.id,
        version: publishedVersion.version,
        type: 'approved',
        typeLabel: '审核通过',
        operatorId: 'u002',
        operatorName: '王建国',
        description: `审核通过 v${publishedVersion.version}，内容符合合规要求`,
        timestamp: t.updatedAt,
      });
    }
  }
});
initReviews.forEach(r => {
  if (r.status === 'pending') {
    initActivityLogs.push({
      id: generateId('log'),
      templateId: r.templateId,
      versionId: r.versionId,
      version: r.version,
      type: 'submitted',
      typeLabel: '提交审核',
      operatorId: r.submitterId,
      operatorName: r.submitterName,
      description: r.changeSummary,
      timestamp: r.submitTime,
      reviewId: r.id,
    });
  } else {
    initActivityLogs.push({
      id: generateId('log'),
      templateId: r.templateId,
      versionId: r.versionId,
      version: r.version,
      type: r.decision === 'approved' ? 'approved' : 'rejected',
      typeLabel: r.decision === 'approved' ? '审核通过' : '审核驳回',
      operatorId: r.reviewerId || 'u002',
      operatorName: r.reviewerName || '王建国',
      description: r.opinion || (r.decision === 'approved' ? '审核通过，内容合规' : '请补充风险条款说明'),
      timestamp: r.reviewTime || r.submitTime,
      reviewId: r.id,
    });
  }
});
initDeploys.forEach(d => {
  if (d.status !== 'withdrawn') {
    initActivityLogs.push({
      id: generateId('log'),
      templateId: d.templateId,
      versionId: d.versionId,
      version: d.version,
      type: 'deployed',
      typeLabel: '已发布',
      operatorId: d.deployedBy,
      operatorName: '张美丽',
      description: `发布到 ${d.storeNames.length} 家门店${d.deployNote ? `，说明：${d.deployNote}` : ''}`,
      timestamp: d.deployedAt,
      deployId: d.id,
    });
  }
});

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      users: initUsers,
      templates: JSON.parse(JSON.stringify(initTemplates)),
      projects: initProjects,
      projectMappings: initProjectMappings,
      reviews: JSON.parse(JSON.stringify(initReviews)),
      stores: initStores,
      deploys: JSON.parse(JSON.stringify(initDeploys)),
      signatures: JSON.parse(JSON.stringify(initSignatures)),
      templateActivityLogs: JSON.parse(JSON.stringify(initActivityLogs)),
      riskTermStats: initRiskTermStats,
      resignStats: initResignStats,
      complaintAssociations: initComplaintAssociations,
      analyticsSummary: initAnalyticsSummary,

      saveTemplateDraft: (templateId, versionId, updates) => {
        const now = new Date().toISOString();
        const operatorId = updates.operatorId || 'u001';
        const operatorName = updates.operatorName || '李晓明';
        set(state => {
          const newTemplates = state.templates.map(t => {
            if (t.id !== templateId) return t;
            const newVersions = t.versions.map(v => {
              if (v.id !== versionId) return v;
              return {
                ...v,
                paragraphs: updates.paragraphs ?? v.paragraphs,
                changeLog: updates.changeLog ?? v.changeLog,
              };
            });
            return {
              ...t,
              name: updates.name ?? t.name,
              versions: newVersions,
              updatedAt: now,
            };
          });
          const tpl = state.templates.find(t => t.id === templateId);
          const ver = tpl?.versions.find(v => v.id === versionId);
          const newLog: TemplateActivityLog = {
            id: generateId('log'),
            templateId,
            versionId,
            version: ver?.version,
            type: 'draft_saved',
            typeLabel: '保存草稿',
            operatorId,
            operatorName,
            description: `保存草稿：${updates.changeLog ? updates.changeLog : (updates.paragraphs ? '修改段落内容' : '更新模板信息')}`,
            timestamp: now,
          };
          return {
            templates: newTemplates,
            templateActivityLogs: [newLog, ...state.templateActivityLogs],
          };
        });
      },

      submitTemplateForReview: (templateId, versionId, submitterId, submitterName, changeSummary) => {
        const template = get().templates.find(t => t.id === templateId);
        const version = template?.versions.find(v => v.id === versionId);
        if (!template || !version) return null;

        const now = new Date().toISOString();
        const review: ReviewRecord = {
          id: generateId('review'),
          templateId,
          templateName: template.name,
          versionId,
          version: version.version,
          submitterId,
          submitterName,
          submitTime: now,
          reviewerId: null,
          reviewerName: null,
          reviewTime: null,
          status: 'pending',
          decision: null,
          opinion: null,
          changeSummary,
        };

        const submitLog: TemplateActivityLog = {
          id: generateId('log'),
          templateId,
          versionId,
          version: version.version,
          type: 'submitted',
          typeLabel: '提交审核',
          operatorId: submitterId,
          operatorName: submitterName,
          description: changeSummary,
          timestamp: now,
          reviewId: review.id,
        };

        set(state => ({
          reviews: [review, ...state.reviews],
          templates: state.templates.map(t =>
            t.id === templateId ? { ...t, status: 'pending', updatedAt: now } : t
          ),
          templateActivityLogs: [submitLog, ...state.templateActivityLogs],
        }));

        return review;
      },

      processReview: (reviewId, decision, reviewerId, reviewerName, opinion) => {
        const review = get().reviews.find(r => r.id === reviewId);
        if (!review || review.status !== 'pending') return;

        const now = new Date().toISOString();
        const templateStatus: Template['status'] = decision === 'approved' ? 'approved' : 'rejected';

        const reviewLog: TemplateActivityLog = {
          id: generateId('log'),
          templateId: review.templateId,
          versionId: review.versionId,
          version: review.version,
          type: decision === 'approved' ? 'approved' : 'rejected',
          typeLabel: decision === 'approved' ? '审核通过' : '审核驳回',
          operatorId: reviewerId,
          operatorName: reviewerName,
          description: opinion || (decision === 'approved' ? '审核通过，内容合规' : '审核驳回，请修改'),
          timestamp: now,
          reviewId,
        };

        set(state => ({
          reviews: state.reviews.map(r =>
            r.id === reviewId
              ? { ...r, status: decision, decision, reviewerId, reviewerName, reviewTime: now, opinion }
              : r
          ),
          templates: state.templates.map(t =>
            t.id === review.templateId ? { ...t, status: templateStatus, updatedAt: now } : t
          ),
          templateActivityLogs: [reviewLog, ...state.templateActivityLogs],
        }));
      },

      saveProjectMappings: (projectId, mappings) => {
        const validMappings = mappings.map((m, idx) => ({
          ...m,
          isDefault: idx === 0 ? true : m.isDefault,
        }));
        const hasDefault = validMappings.some(m => m.isDefault);
        if (!hasDefault && validMappings.length > 0) {
          validMappings[0].isDefault = true;
        }
        let foundDefault = false;
        const finalMappings = validMappings.map(m => {
          if (m.isDefault && !foundDefault) {
            foundDefault = true;
            return m;
          }
          return { ...m, isDefault: false };
        });
        set(state => ({
          projectMappings: { ...state.projectMappings, [projectId]: finalMappings },
        }));
      },

      createDeployRecord: (deploy) => {
        const now = new Date().toISOString();
        const operatorId = deploy.operatorId || 'u002';
        const operatorName = deploy.operatorName || '王建国';
        const newDeploy: DeployRecord = {
          ...deploy,
          id: generateId('deploy'),
          deployedAt: now,
        };

        const deployLog: TemplateActivityLog = {
          id: generateId('log'),
          templateId: deploy.templateId,
          versionId: deploy.versionId,
          version: deploy.version,
          type: 'deployed',
          typeLabel: '已发布',
          operatorId,
          operatorName,
          description: `发布到 ${deploy.storeNames?.length || 0} 家门店${deploy.deployNote ? `，说明：${deploy.deployNote}` : ''}`,
          timestamp: now,
          deployId: newDeploy.id,
        };

        set(state => ({
          deploys: [newDeploy, ...state.deploys],
          templateActivityLogs: [deployLog, ...state.templateActivityLogs],
        }));
      },

      withdrawDeploy: (deployId, operatorId, operatorName) => {
        const deploy = get().deploys.find(d => d.id === deployId);
        if (!deploy) return;
        const now = new Date().toISOString();
        const opId = operatorId || 'u002';
        const opName = operatorName || '王建国';

        const withdrawLog: TemplateActivityLog = {
          id: generateId('log'),
          templateId: deploy.templateId,
          versionId: deploy.versionId,
          version: deploy.version,
          type: 'withdrawn',
          typeLabel: '已撤下',
          operatorId: opId,
          operatorName: opName,
          description: `撤下发布记录`,
          timestamp: now,
          deployId,
        };

        set(state => ({
          deploys: state.deploys.map(d =>
            d.id === deployId
              ? { ...d, status: 'withdrawn' as const, withdrawnAt: now }
              : d
          ),
          templateActivityLogs: [withdrawLog, ...state.templateActivityLogs],
        }));
      },

      getSignatureById: (id) => {
        return get().signatures.find(s => s.id === id);
      },

      getTemplateActivityLogs: (templateId) => {
        return get().templateActivityLogs
          .filter(log => log.templateId === templateId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      getReviewActivityLogs: (reviewId) => {
        return get().templateActivityLogs
          .filter(log => log.reviewId === reviewId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      getDeployById: (id) => {
        return get().deploys.find(d => d.id === id);
      },

      getComplaintSignatures: () => {
        return get().signatures.filter(s => signatureHasComplaint(s.id));
      },

      getSignaturesByParagraphId: (paragraphId) => {
        return get().signatures.filter(s =>
          s.paragraphReadings.some(p => p.paragraphId === paragraphId)
        );
      },

      resetToInitial: () => {
        set({
          templates: JSON.parse(JSON.stringify(initTemplates)),
          reviews: JSON.parse(JSON.stringify(initReviews)),
          deploys: JSON.parse(JSON.stringify(initDeploys)),
          signatures: JSON.parse(JSON.stringify(initSignatures)),
          projectMappings: initProjectMappings,
          templateActivityLogs: JSON.parse(JSON.stringify(initActivityLogs)),
        });
      },
    }),
    {
      name: 'medical-compliance-store',
      partialize: state => ({
        templates: state.templates,
        projectMappings: state.projectMappings,
        reviews: state.reviews,
        deploys: state.deploys,
        signatures: state.signatures,
        templateActivityLogs: state.templateActivityLogs,
      }),
      version: 2,
    }
  )
);
