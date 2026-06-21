import { create } from 'zustand';
import {
  Template,
  TemplateVersion,
  MedicalProject,
  ProjectTemplateMapping,
  ReviewRecord,
  Store,
  DeployRecord,
  SignatureRecord,
  RiskStats,
  TemplateCategory,
  TemplateStatus,
  PagedData,
} from '../../shared/types';

interface LoadingState {
  templates: boolean;
  templateVersions: boolean;
  projects: boolean;
  mappings: boolean;
  reviews: boolean;
  stores: boolean;
  deploys: boolean;
  signatures: boolean;
  analytics: boolean;
}

interface Filters {
  templateCategory?: TemplateCategory;
  templateStatus?: TemplateStatus;
  searchKeyword?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  storeRegion?: string;
  dateRange?: { start: string; end: string };
  page: number;
  pageSize: number;
}

interface DataState {
  templates: Template[];
  templateVersions: Record<string, TemplateVersion[]>;
  selectedTemplate: Template | null;
  selectedVersion: TemplateVersion | null;

  projects: MedicalProject[];
  projectMappings: Record<string, ProjectTemplateMapping[]>;

  reviews: ReviewRecord[];
  selectedReview: ReviewRecord | null;

  stores: Store[];
  deploys: DeployRecord[];

  signatures: PagedData<SignatureRecord>;
  selectedSignature: SignatureRecord | null;

  riskStats: RiskStats | null;

  loading: LoadingState;
  filters: Filters;
  error: string | null;

  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (template: Template) => void;
  setSelectedTemplate: (template: Template | null) => void;
  setTemplateVersions: (templateId: string, versions: TemplateVersion[]) => void;
  addTemplateVersion: (templateId: string, version: TemplateVersion) => void;
  setSelectedVersion: (version: TemplateVersion | null) => void;

  setProjects: (projects: MedicalProject[]) => void;
  setProjectMappings: (projectId: string, mappings: ProjectTemplateMapping[]) => void;
  updateProjectMapping: (projectId: string, mapping: ProjectTemplateMapping) => void;

  setReviews: (reviews: ReviewRecord[]) => void;
  addReview: (review: ReviewRecord) => void;
  updateReview: (review: ReviewRecord) => void;
  setSelectedReview: (review: ReviewRecord | null) => void;

  setStores: (stores: Store[]) => void;
  setDeploys: (deploys: DeployRecord[]) => void;
  addDeploy: (deploy: DeployRecord) => void;
  updateDeploy: (deploy: DeployRecord) => void;

  setSignatures: (signatures: PagedData<SignatureRecord>) => void;
  setSelectedSignature: (signature: SignatureRecord | null) => void;

  setRiskStats: (stats: RiskStats | null) => void;

  setLoading: (key: keyof LoadingState, value: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
}

const initialLoading: LoadingState = {
  templates: false,
  templateVersions: false,
  projects: false,
  mappings: false,
  reviews: false,
  stores: false,
  deploys: false,
  signatures: false,
  analytics: false,
};

const initialFilters: Filters = {
  page: 1,
  pageSize: 20,
};

export const useDataStore = create<DataState>((set) => ({
  templates: [],
  templateVersions: {},
  selectedTemplate: null,
  selectedVersion: null,

  projects: [],
  projectMappings: {},

  reviews: [],
  selectedReview: null,

  stores: [],
  deploys: [],

  signatures: {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
  },
  selectedSignature: null,

  riskStats: null,

  loading: initialLoading,
  filters: initialFilters,
  error: null,

  setTemplates: (templates) => set({ templates }),
  addTemplate: (template) =>
    set((state) => ({ templates: [template, ...state.templates] })),
  updateTemplate: (template) =>
    set((state) => ({
      templates: state.templates.map((t) => (t.id === template.id ? template : t)),
    })),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setTemplateVersions: (templateId, versions) =>
    set((state) => ({
      templateVersions: { ...state.templateVersions, [templateId]: versions },
    })),
  addTemplateVersion: (templateId, version) =>
    set((state) => ({
      templateVersions: {
        ...state.templateVersions,
        [templateId]: [version, ...(state.templateVersions[templateId] || [])],
      },
    })),
  setSelectedVersion: (version) => set({ selectedVersion: version }),

  setProjects: (projects) => set({ projects }),
  setProjectMappings: (projectId, mappings) =>
    set((state) => ({
      projectMappings: { ...state.projectMappings, [projectId]: mappings },
    })),
  updateProjectMapping: (projectId, mapping) =>
    set((state) => {
      const existing = state.projectMappings[projectId] || [];
      const idx = existing.findIndex((m) => m.id === mapping.id);
      const updated = idx >= 0
        ? existing.map((m) => (m.id === mapping.id ? mapping : m))
        : [...existing, mapping];
      return {
        projectMappings: { ...state.projectMappings, [projectId]: updated },
      };
    }),

  setReviews: (reviews) => set({ reviews }),
  addReview: (review) =>
    set((state) => ({ reviews: [review, ...state.reviews] })),
  updateReview: (review) =>
    set((state) => ({
      reviews: state.reviews.map((r) => (r.id === review.id ? review : r)),
    })),
  setSelectedReview: (review) => set({ selectedReview: review }),

  setStores: (stores) => set({ stores }),
  setDeploys: (deploys) => set({ deploys }),
  addDeploy: (deploy) =>
    set((state) => ({ deploys: [deploy, ...state.deploys] })),
  updateDeploy: (deploy) =>
    set((state) => ({
      deploys: state.deploys.map((d) => (d.id === deploy.id ? deploy : d)),
    })),

  setSignatures: (signatures) => set({ signatures }),
  setSelectedSignature: (signature) => set({ selectedSignature: signature }),

  setRiskStats: (stats) => set({ riskStats: stats }),

  setLoading: (key, value) =>
    set((state) => ({ loading: { ...state.loading, [key]: value } })),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: initialFilters }),
}));
