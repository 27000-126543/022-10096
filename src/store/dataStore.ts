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

interface DataState {
  users: User[];
  templates: Template[];
  projects: Project[];
  projectMappings: Record<string, ProjectMappingConfig[]>;
  reviews: ReviewRecord[];
  stores: Store[];
  deploys: DeployRecord[];
  signatures: SignatureRecord[];
  riskTermStats: RiskTermStats[];
  resignStats: ReSignStats[];
  complaintAssociations: ComplaintAssociation[];
  analyticsSummary: AnalyticsSummary;

  saveTemplateDraft: (templateId: string, versionId: string, updates: {
    name?: string;
    paragraphs?: TemplateParagraph[];
    changeLog?: string;
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

  createDeployRecord: (deploy: Omit<DeployRecord, 'id' | 'deployedAt'>) => void;

  withdrawDeploy: (deployId: string) => void;

  getSignatureById: (id: string) => SignatureRecord | undefined;

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
      riskTermStats: initRiskTermStats,
      resignStats: initResignStats,
      complaintAssociations: initComplaintAssociations,
      analyticsSummary: initAnalyticsSummary,

      saveTemplateDraft: (templateId, versionId, updates) => {
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
              updatedAt: new Date().toISOString(),
            };
          });
          return { templates: newTemplates };
        });
      },

      submitTemplateForReview: (templateId, versionId, submitterId, submitterName, changeSummary) => {
        const template = get().templates.find(t => t.id === templateId);
        const version = template?.versions.find(v => v.id === versionId);
        if (!template || !version) return null;

        const review: ReviewRecord = {
          id: generateId('review'),
          templateId,
          templateName: template.name,
          versionId,
          version: version.version,
          submitterId,
          submitterName,
          submitTime: new Date().toISOString(),
          reviewerId: null,
          reviewerName: null,
          reviewTime: null,
          status: 'pending',
          decision: null,
          opinion: null,
          changeSummary,
        };

        set(state => ({
          reviews: [review, ...state.reviews],
          templates: state.templates.map(t =>
            t.id === templateId ? { ...t, status: 'pending', updatedAt: new Date().toISOString() } : t
          ),
        }));

        return review;
      },

      processReview: (reviewId, decision, reviewerId, reviewerName, opinion) => {
        const review = get().reviews.find(r => r.id === reviewId);
        if (!review || review.status !== 'pending') return;

        const now = new Date().toISOString();
        const templateStatus: Template['status'] = decision === 'approved' ? 'approved' : 'rejected';

        set(state => ({
          reviews: state.reviews.map(r =>
            r.id === reviewId
              ? { ...r, status: decision, decision, reviewerId, reviewerName, reviewTime: now, opinion }
              : r
          ),
          templates: state.templates.map(t =>
            t.id === review.templateId ? { ...t, status: templateStatus, updatedAt: now } : t
          ),
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
        const newDeploy: DeployRecord = {
          ...deploy,
          id: generateId('deploy'),
          deployedAt: new Date().toISOString(),
        };
        set(state => ({
          deploys: [newDeploy, ...state.deploys],
        }));
      },

      withdrawDeploy: (deployId) => {
        set(state => ({
          deploys: state.deploys.map(d =>
            d.id === deployId
              ? { ...d, status: 'withdrawn' as const, withdrawnAt: new Date().toISOString() }
              : d
          ),
        }));
      },

      getSignatureById: (id) => {
        return get().signatures.find(s => s.id === id);
      },

      resetToInitial: () => {
        set({
          templates: JSON.parse(JSON.stringify(initTemplates)),
          reviews: JSON.parse(JSON.stringify(initReviews)),
          deploys: JSON.parse(JSON.stringify(initDeploys)),
          signatures: JSON.parse(JSON.stringify(initSignatures)),
          projectMappings: initProjectMappings,
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
      }),
      version: 1,
    }
  )
);
