## 1. 架构设计

本项目采用前后端分离架构，前端为纯React单页应用，后端使用Express提供RESTful API服务，数据存储采用SQLite（开发演示阶段），前端状态管理使用Zustand。UI组件基于Tailwind CSS自定义设计系统，不依赖第三方组件库以确保专业合规风格的独特性。

```mermaid
graph TB
    subgraph Client["前端层 (React 18 + TypeScript)"]
        A1["路由层 (React Router)"]
        A2["页面组件 (6大模块)"]
        A3["业务组件库 (表格/表单/时间轴)"]
        A4["状态管理 (Zustand)"]
        A5["图表展示 (Recharts)"]
    end
    subgraph Server["服务层 (Express 4 + TypeScript)"]
        B1["API路由 (模板/项目/审核/发布/签署/统计)"]
        B2["中间件 (鉴权/日志/错误处理)"]
        B3["业务服务层 (Service)"]
        B4["数据访问层 (Repository)"]
    end
    subgraph Data["数据层"]
        C1["SQLite 数据库"]
        C2["Mock 数据 (演示用)"]
    end
    A1 --> A2
    A2 --> A3
    A2 --> A4
    A2 --> A5
    A4 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> C1
    B4 --> C2
```

## 2. 技术说明

- **前端**：React@18 + TypeScript + Vite + Tailwind CSS@3 + Zustand + Recharts + React Router DOM + Lucide React
- **后端**：Express@4 + TypeScript + better-sqlite3（SQLite驱动）
- **初始化工具**：vite-init 使用 react-express-ts 模板
- **数据库**：SQLite（本地文件存储，适合演示；生产可迁移至PostgreSQL）
- **数据策略**：内置完整Mock数据，首次启动自动初始化演示数据，无需额外配置

## 3. 路由定义

| 前端路由 | 页面组件 | 功能说明 |
|----------|----------|----------|
| `/` | Dashboard | 首页概览看板，展示待办事项和关键指标 |
| `/templates` | TemplateList | 模板库列表页，分类浏览模板 |
| `/templates/:id` | TemplateEditor | 模板编辑器，创建/编辑模板及段落 |
| `/projects` | ProjectMapping | 项目映射，医美项目与模板版本关联 |
| `/reviews` | ReviewList | 版本审核列表，待审核/已审核 |
| `/reviews/:id` | ReviewDetail | 版本审核详情，差异对比和审核操作 |
| `/deploy` | DeployCenter | 门店发布中心，发布范围选择和配置 |
| `/signatures` | SignatureList | 签署追踪列表，查询签署记录 |
| `/signatures/:id` | SignatureDetail | 签署详情，快照展示和导出 |
| `/analytics` | RiskAnalytics | 风险统计看板，数据图表和报表 |
| `/login` | LoginPage | 登录页，角色切换演示 |

## 4. API 定义

### 4.1 通用响应结构

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

interface PagedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 4.2 模板相关API

```typescript
// 模板分类
enum TemplateCategory {
  INJECTION = 'injection',    // 注射类
  SKIN = 'skin',              // 皮肤类
  PLASTIC = 'plastic',        // 整形外科
  ANTI_AGING = 'anti_aging'   // 抗衰类
}

// 模板状态
enum TemplateStatus {
  DRAFT = 'draft',            // 草稿
  REVIEWING = 'reviewing',    // 审核中
  APPROVED = 'approved',      // 审核通过
  REJECTED = 'rejected',      // 驳回
  PUBLISHED = 'published'     // 已发布
}

// 段落类型
enum SectionType {
  INTRODUCTION = 'introduction',     // 项目介绍
  CONTRAINDICATION = 'contraindication', // 禁忌症
  ALTERNATIVE = 'alternative',       // 替代方案
  POST_CARE = 'post_care',           // 术后护理
  DISPUTE = 'dispute',               // 争议处理
  CUSTOM = 'custom'                  // 自定义
}

interface Template {
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

interface TemplateVersion {
  id: string;
  templateId: string;
  version: string;
  changeNote: string;
  sections: TemplateSection[];
  createdAt: string;
  createdBy: string;
}

interface TemplateSection {
  id: string;
  type: SectionType;
  title: string;
  content: string;  // HTML富文本
  order: number;
  isRiskHighlight: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

// GET /api/templates - 获取模板列表（支持分类筛选、搜索、分页）
// GET /api/templates/:id - 获取模板详情（含最新版本）
// GET /api/templates/:id/versions - 获取模板所有版本
// POST /api/templates - 创建新模板
// PUT /api/templates/:id - 更新模板基本信息
// POST /api/templates/:id/versions - 创建新版本
// POST /api/templates/:id/submit - 提交审核
```

### 4.3 项目映射API

```typescript
interface MedicalProject {
  id: string;
  code: string;
  name: string;
  category: TemplateCategory;
  parentId?: string;
  sort: number;
}

interface ProjectTemplateMapping {
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

// GET /api/projects - 获取项目树
// GET /api/projects/:id/mappings - 获取项目的模板映射
// PUT /api/projects/:id/mappings - 更新项目模板映射配置
```

### 4.4 版本审核API

```typescript
enum ReviewDecision {
  APPROVE = 'approve',
  REJECT = 'reject'
}

interface ReviewRecord {
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

// GET /api/reviews - 获取审核列表（按状态筛选）
// GET /api/reviews/:id - 获取审核详情（含版本差异）
// GET /api/reviews/:id/diff - 获取版本差异数据
// POST /api/reviews/:id/decision - 提交审核决策
```

### 4.5 门店发布API

```typescript
interface Store {
  id: string;
  name: string;
  code: string;
  city: string;
  province: string;
  region: 'north' | 'east' | 'south' | 'west' | 'central';
  isActive: boolean;
}

interface DeployRecord {
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

// GET /api/stores - 获取门店列表（按区域/城市筛选）
// GET /api/deploys - 获取发布记录
// POST /api/deploys - 新建发布
// POST /api/deploys/:id/revoke - 撤下发布
```

### 4.6 签署追踪API

```typescript
interface SignatureRecord {
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

interface SectionMetric {
  sectionId: string;
  sectionTitle: string;
  dwellTimeSeconds: number;
  revisitCount: number;
  scrollDepthPercent: number;
}

interface ConfirmationAction {
  id: string;
  type: 'read' | 'explain' | 'confirm' | 'sign';
  label: string;
  timestamp: string;
  operator: string;
}

// GET /api/signatures - 获取签署记录（支持多条件筛选、分页）
// GET /api/signatures/:id - 获取签署详情（含模板快照和时间轴）
// GET /api/signatures/:id/export - 导出签署档案PDF
// GET /api/signatures/export/batch - 批量导出
```

### 4.7 风险统计API

```typescript
interface RiskStats {
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

// GET /api/analytics/summary - 获取统计总览
// GET /api/analytics/sections - 条款维度详细统计
// GET /api/analytics/projects - 项目维度详细统计
// GET /api/analytics/export - 导出报表
```

## 5. 服务端架构图

```mermaid
graph LR
    subgraph Controller["控制器层"]
        C1["TemplateController"]
        C2["ProjectController"]
        C3["ReviewController"]
        C4["DeployController"]
        C5["SignatureController"]
        C6["AnalyticsController"]
        C7["AuthController"]
    end
    subgraph Service["服务层"]
        S1["TemplateService"]
        S2["ProjectService"]
        S3["ReviewService"]
        S4["DeployService"]
        S5["SignatureService"]
        S6["AnalyticsService"]
        S7["DiffService"]
    end
    subgraph Repository["仓储层"]
        R1["TemplateRepo"]
        R2["ProjectRepo"]
        R3["ReviewRepo"]
        R4["DeployRepo"]
        R5["SignatureRepo"]
        R6["StoreRepo"]
    end
    subgraph DB["数据库"]
        DB1["SQLite"]
    end
    C1 --> S1
    C2 --> S2
    C3 --> S3
    C4 --> S4
    C5 --> S5
    C6 --> S6
    S1 --> S7
    S1 --> R1
    S2 --> R1 --> R2
    S3 --> R3 --> R1
    S4 --> R4 --> R5
    S5 --> R5 --> R1
    S6 --> R5
    R1 --> DB1
    R2 --> DB1
    R3 --> DB1
    R4 --> DB1
    R5 --> DB1
    R6 --> DB1
```

## 6. 数据模型

### 6.1 ER图

```mermaid
erDiagram
    USER ||--o{ TEMPLATE : creates
    USER ||--o{ REVIEW_RECORD : submits
    USER ||--o{ REVIEW_RECORD : reviews
    USER ||--o{ DEPLOY_RECORD : publishes
    TEMPLATE ||--o{ TEMPLATE_VERSION : has
    TEMPLATE_VERSION ||--o{ TEMPLATE_SECTION : contains
    TEMPLATE_VERSION ||--o{ REVIEW_RECORD : "under review"
    TEMPLATE_VERSION ||--o{ DEPLOY_RECORD : "deployed via"
    TEMPLATE_VERSION ||--o{ PROJECT_MAPPING : "mapped in"
    TEMPLATE_VERSION ||--o{ SIGNATURE_RECORD : "used in"
    MEDICAL_PROJECT ||--o{ PROJECT_MAPPING : "has"
    STORE ||--o{ DEPLOY_RECORD : "targeted"
    STORE ||--o{ SIGNATURE_RECORD : "signed at"
    MEDICAL_PROJECT ||--o{ SIGNATURE_RECORD : "for project"
    SIGNATURE_RECORD ||--o{ SECTION_METRIC : "has"
    SIGNATURE_RECORD ||--o{ CONFIRMATION_ACTION : "has"

    USER {
        string id PK
        string username
        string realName
        string role
        string department
        string passwordHash
    }
    TEMPLATE {
        string id PK
        string name
        string category
        string status
        string currentVersion
        string latestVersionId FK
        string createdBy FK
        datetime createdAt
        datetime updatedAt
    }
    TEMPLATE_VERSION {
        string id PK
        string templateId FK
        string version
        string changeNote
        string createdBy FK
        datetime createdAt
    }
    TEMPLATE_SECTION {
        string id PK
        string versionId FK
        string type
        string title
        text content
        int order
        boolean isRiskHighlight
        string riskLevel
    }
    MEDICAL_PROJECT {
        string id PK
        string code
        string name
        string category
        string parentId FK
        int sort
    }
    PROJECT_MAPPING {
        string id PK
        string projectId FK
        string templateId FK
        string versionId FK
        string populationType
        string populationLabel
        boolean isDefault
        int minAge
        int maxAge
    }
    REVIEW_RECORD {
        string id PK
        string versionId FK
        string submitterId FK
        datetime submittedAt
        string reviewerId FK
        datetime reviewedAt
        string decision
        text reviewComment
        text changeSummary
        string status
    }
    STORE {
        string id PK
        string name
        string code
        string city
        string province
        string region
        boolean isActive
    }
    DEPLOY_RECORD {
        string id PK
        string versionId FK
        text storeIds
        text cityNames
        string deployType
        datetime scheduledAt
        datetime effectiveAt
        string status
        datetime revokedAt
        string publishedBy FK
        string versionNote
    }
    SIGNATURE_RECORD {
        string id PK
        string customerName
        string customerIdMasked
        string projectId FK
        string templateId FK
        string versionId FK
        string storeId FK
        string advisorName
        datetime signedAt
        boolean isResign
        string resignReason
        string signatureUrl
        boolean hasComplaint
    }
    SECTION_METRIC {
        string id PK
        string signatureId FK
        string sectionId
        string sectionTitle
        int dwellSeconds
        int revisitCount
        int scrollDepth
    }
    CONFIRMATION_ACTION {
        string id PK
        string signatureId FK
        string type
        string label
        datetime timestamp
        string operator
    }
```

### 6.2 初始化数据

系统首次启动时自动初始化以下演示数据：
- 3个用户账号：法务专员（李法务）、医务负责人（王主任）、门店院长（张院长）
- 4个模板分类：注射类、皮肤类、整形外科、抗衰类
- 每个分类2-3个示例模板，含完整段落内容和版本历史
- 12个医美项目及与模板的映射关系（含成人/未成年/二次治疗版本）
- 5条审核记录（2条待审核、2条已通过、1条已驳回）
- 20家门店分布于5个区域
- 8条发布记录
- 200条签署记录，含真实停留时长和确认动作数据
- 完整风险统计数据
