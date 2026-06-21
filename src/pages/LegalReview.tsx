import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  XCircle,
  Send,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  Download,
  Filter,
  Eye,
  ChevronDown,
  ChevronRight,
  Store,
  FileText,
  User,
  Tag,
  Clock,
  Scale,
  FileSearch,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  useDataStore,
  signatureHasComplaint,
  getComplaintDetail,
  DeployRecordExtended,
} from '@/store/dataStore';
import {
  riskTermStats,
  templates,
  stores,
  RiskTermStats,
  ReviewRecord,
  SignatureRecord,
} from '@/data/localMock';

type TabType = 'rejected' | 'replaced' | 'complaint' | 'riskTerms';

function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.toLocaleDateString('zh-CN')} ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
}

function maskName(name: string): string {
  if (!name || name.length <= 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

export default function LegalReview() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('rejected');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<number>(7);

  const summary = useDataStore((s) => s.getLegalReviewSummary());
  const getRejectedReviews = useDataStore((s) => s.getRejectedReviews);
  const getRecentReplacedDeploys = useDataStore((s) => s.getRecentReplacedDeploys);
  const getComplaintSignatures = useDataStore((s) => s.getComplaintSignatures);
  const exportTraceList = useDataStore((s) => s.exportTraceList);

  const kpiData = useMemo(() => {
    return [
      {
        title: '待审核数',
        value: summary.pendingReviews,
        icon: FileCheck,
        iconBg: 'bg-primary-100',
        iconColor: 'text-primary-600',
        borderColor: 'border-primary-200',
        gradient: 'from-primary-500 to-primary-700',
      },
      {
        title: '近7天驳回数',
        value: summary.rejectedReviews7d,
        icon: XCircle,
        iconBg: 'bg-danger-100',
        iconColor: 'text-danger-600',
        borderColor: 'border-danger-200',
        gradient: 'from-danger-500 to-danger-700',
      },
      {
        title: '生效发布数',
        value: summary.activeDeploys,
        icon: Send,
        iconBg: 'bg-success-100',
        iconColor: 'text-success-600',
        borderColor: 'border-success-200',
        gradient: 'from-success-500 to-success-700',
      },
      {
        title: '近7天版本替换数',
        value: summary.replacedDeploys7d,
        icon: RefreshCw,
        iconBg: 'bg-warning-100',
        iconColor: 'text-warning-600',
        borderColor: 'border-warning-200',
        gradient: 'from-warning-500 to-warning-700',
      },
      {
        title: '涉诉档案数',
        value: summary.complaintSignatures,
        icon: AlertTriangle,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-700',
        borderColor: 'border-red-200',
        gradient: 'from-red-600 to-red-800',
      },
      {
        title: '高风险条款数',
        value: summary.highRiskTerms,
        icon: ShieldAlert,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        borderColor: 'border-purple-200',
        gradient: 'from-purple-500 to-purple-700',
      },
    ];
  }, [summary]);

  const handleExport = () => {
    const data = exportTraceList({
      templateId: templateFilter !== 'all' ? templateFilter : undefined,
      storeId: storeFilter !== 'all' ? storeFilter : undefined,
    });

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    const csvContent = [
      ['签署ID', '顾客姓名', '项目', '模板', '版本', '门店', '签署时间', '是否涉诉', '风险条款'].join(','),
      ...data.map((item) =>
        [
          item.signatureId,
          item.customerName,
          item.projectName,
          item.templateName,
          item.templateVersion,
          item.storeName,
          item.signedAt,
          item.hasComplaint ? '是' : '否',
          '"' + item.riskTerms.join('; ') + '"',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `法务追溯清单_${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabItems = [
    { key: 'rejected' as const, label: '审核驳回', icon: XCircle, count: summary.rejectedReviews7d },
    { key: 'replaced' as const, label: '发布替换', icon: RefreshCw, count: summary.replacedDeploys7d },
    { key: 'complaint' as const, label: '涉诉档案', icon: AlertTriangle, count: summary.complaintSignatures },
    { key: 'riskTerms' as const, label: '高风险条款', icon: ShieldAlert, count: summary.highRiskTerms },
  ];

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-1">法务复盘面板</h1>
          <p className="text-sm text-neutral-500">
            整合视图，快速定位合规风险，辅助法务专员高效决策
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm text-white bg-primary-500 hover:bg-primary-600 rounded-sm transition-colors shadow-sm"
          >
            <Download size={14} />
            导出追溯清单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 mb-6">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={cn(
                'relative bg-white border rounded-sm shadow-paper overflow-hidden'
              )}
              style={{ borderColor: 'var(--color-neutral-200)' }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
                style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-500), var(--color-primary-700))` }}
              />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-neutral-600 font-medium">{kpi.title}</div>
                  </div>
                  <div className={cn('w-10 h-10 rounded-sm flex items-center justify-center', kpi.iconBg)}>
                    <Icon size={18} className={kpi.iconColor} />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-neutral-800">{kpi.value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm shadow-paper overflow-hidden mb-6">
        <div className="flex items-center gap-4 px-5 py-3 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-neutral-500" />
            <span className="text-sm font-medium text-neutral-700">筛选条件</span>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-500">模板：</label>
              <select
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
                className="text-xs border border-neutral-300 rounded-sm px-2 py-1.5 bg-white text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
              >
                <option value="all">全部模板</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-500">门店：</label>
              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="text-xs border border-neutral-300 rounded-sm px-2 py-1.5 bg-white text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
              >
                <option value="all">全部门店</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-500">时间范围：</label>
              <div className="flex items-center bg-neutral-100 rounded-sm p-0.5">
                {[
                  { value: 7, label: '近7天' },
                  { value: 30, label: '近30天' },
                  { value: 0, label: '全部' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTimeRange(opt.value)}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-sm transition-colors',
                      timeRange === opt.value
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-800'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm shadow-paper overflow-hidden">
        <div className="flex items-center border-b border-neutral-200 px-4 bg-neutral-50/50">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-6 py-4 text-sm font-medium relative transition-colors flex items-center gap-2',
                  isActive
                    ? 'text-primary-600'
                    : 'text-neutral-600 hover:text-neutral-800'
                )}
              >
                <Icon size={15} />
                {tab.label}
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-medium rounded-full px-1.5 bg-neutral-200 text-neutral-600">
                  {tab.count}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'rejected' && <RejectedTab days={timeRange || undefined} />}
        {activeTab === 'replaced' && <ReplacedTab days={timeRange || undefined} />}
        {activeTab === 'complaint' && <ComplaintTab />}
        {activeTab === 'riskTerms' && <RiskTermsTab />}
      </div>
    </div>
  );
}

function RejectedTab({ days }: { days?: number }) {
  const navigate = useNavigate();
  const getRejectedReviews = useDataStore((s) => s.getRejectedReviews);

  const rejectedReviews = useMemo(() => {
    return getRejectedReviews(days);
  }, [getRejectedReviews, days]);

  const columns = [
    {
      key: 'templateName',
      title: '模板名称',
      width: '280px',
      render: (row: ReviewRecord) => (
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={14} className="text-primary-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{row.templateName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'version',
      title: '版本号',
      width: '100px',
      align: 'center' as const,
      render: (row: ReviewRecord) => (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-sm">
          v{row.version}
        </span>
      ),
    },
    {
      key: 'submitterName',
      title: '提交人',
      width: '100px',
      align: 'center' as const,
      render: (row: ReviewRecord) => (
        <span className="text-sm text-neutral-700">{row.submitterName}</span>
      ),
    },
    {
      key: 'reviewTime',
      title: '驳回时间',
      width: '160px',
      align: 'center' as const,
      render: (row: ReviewRecord) => (
        <div className="flex items-center justify-center gap-1">
          <Clock size={12} className="text-neutral-400" />
          <span className="text-xs text-neutral-600">
            {row.reviewTime ? formatDate(row.reviewTime) : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'opinion',
      title: '驳回意见',
      render: (row: ReviewRecord) => (
        <div className="max-w-xs">
          <p className="text-xs text-neutral-600 truncate" title={row.opinion || ''}>
            {row.opinion || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: '120px',
      align: 'center' as const,
      render: (row: ReviewRecord) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/reviews/${row.id}`);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200 rounded-sm transition-colors"
          >
            <Eye size={11} />
            查看详情
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <XCircle size={16} className="text-danger-600" />
          <h3 className="text-sm font-semibold text-neutral-800">最近驳回的审核记录</h3>
        </div>
        <span className="text-[11px] text-neutral-500">
          共 {rejectedReviews.length} 条驳回记录
        </span>
      </div>
      <DataTable
        columns={columns}
        data={rejectedReviews}
        rowKey="id"
        pageSize={10}
        stripe
        onRowClick={(row) => navigate(`/reviews/${row.id}`)}
      />
    </div>
  );
}

function ReplacedTab({ days }: { days?: number }) {
  const getRecentReplacedDeploys = useDataStore((s) => s.getRecentReplacedDeploys);
  const [expandedDeployId, setExpandedDeployId] = useState<string | null>(null);

  const replacedDeploys = useMemo(() => {
    return getRecentReplacedDeploys(days);
  }, [getRecentReplacedDeploys, days]);

  const toggleExpand = (deployId: string) => {
    setExpandedDeployId((prev) => (prev === deployId ? null : deployId));
  };

  const columns = [
    {
      key: 'templateName',
      title: '模板名称',
      width: '280px',
      render: (row: DeployRecordExtended) => (
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={14} className="text-primary-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{row.templateName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'newVersion',
      title: '新版本号',
      width: '100px',
      align: 'center' as const,
      render: (row: DeployRecordExtended) => (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium bg-success-50 text-success-700 border border-success-200 rounded-sm">
          v{row.version}
        </span>
      ),
    },
    {
      key: 'oldVersion',
      title: '旧版本号',
      width: '100px',
      align: 'center' as const,
      render: (row: DeployRecordExtended) => {
        const oldVersion = row.replacedDeployIds?.length > 0 ? '旧版' : '-';
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium bg-neutral-100 text-neutral-500 border border-neutral-200 rounded-sm">
            {oldVersion}
          </span>
        );
      },
    },
    {
      key: 'storeCount',
      title: '替换门店数',
      width: '100px',
      align: 'center' as const,
      render: (row: DeployRecordExtended) => (
        <div className="flex items-center justify-center gap-1">
          <Store size={12} className="text-primary-500" />
          <span className="text-sm font-medium text-neutral-700">{row.storeNames?.length || 0}</span>
        </div>
      ),
    },
    {
      key: 'replacedAt',
      title: '替换时间',
      width: '160px',
      align: 'center' as const,
      render: (row: DeployRecordExtended) => (
        <div className="flex items-center justify-center gap-1">
          <Clock size={12} className="text-neutral-400" />
          <span className="text-xs text-neutral-600">
            {row.replacedAt ? formatDate(row.replacedAt) : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: '120px',
      align: 'center' as const,
      render: (row: DeployRecordExtended) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(row.id);
            }}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-sm transition-colors',
              expandedDeployId === row.id
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200'
            )}
          >
            {expandedDeployId === row.id ? (
              <>
                <ChevronDown size={11} />
                收起
              </>
            ) : (
              <>
                <Eye size={11} />
                查看详情
              </>
            )}
          </button>
        </div>
      ),
    },
  ];

  const expandedDeploy = replacedDeploys.find((d) => d.id === expandedDeployId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-warning-600" />
          <h3 className="text-sm font-semibold text-neutral-800">最近版本替换记录</h3>
        </div>
        <span className="text-[11px] text-neutral-500">
          共 {replacedDeploys.length} 条替换记录
        </span>
      </div>
      <DataTable
        columns={columns}
        data={replacedDeploys}
        rowKey="id"
        pageSize={10}
        stripe
        onRowClick={(row) => toggleExpand(row.id)}
      />

      {expandedDeploy && (
        <div className="mt-4 bg-white border border-warning-200 rounded-sm shadow-md overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-warning-50 to-white border-b border-warning-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-warning-100 flex items-center justify-center">
                <RefreshCw size={18} className="text-warning-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-800">
                  「{expandedDeploy.templateName}」版本替换详情
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  新版本 v{expandedDeploy.version} 替换旧版本
                </p>
              </div>
            </div>
            <button
              onClick={() => setExpandedDeployId(null)}
              className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 px-5 py-4 bg-neutral-50/50 border-b border-neutral-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-700 font-mono">
                {expandedDeploy.storeNames?.length || 0}
              </div>
              <div className="text-xs text-neutral-500 mt-1">替换门店数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success-600">v{expandedDeploy.version}</div>
              <div className="text-xs text-neutral-500 mt-1">新版本</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-neutral-500">
                {expandedDeploy.replacedDeployIds?.length || 0} 个
              </div>
              <div className="text-xs text-neutral-500 mt-1">被替换版本数</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-neutral-700">
                {expandedDeploy.replacedAt ? formatDate(expandedDeploy.replacedAt) : '-'}
              </div>
              <div className="text-xs text-neutral-500 mt-1">替换时间</div>
            </div>
          </div>

          {expandedDeploy.storeNames && expandedDeploy.storeNames.length > 0 && (
            <div className="px-5 py-4">
              <div className="text-xs font-medium text-neutral-600 mb-2">替换门店列表：</div>
              <div className="flex flex-wrap gap-2">
                {expandedDeploy.storeNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-primary-50 text-primary-700 border border-primary-200 rounded-sm"
                  >
                    <Store size={10} />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {expandedDeploy.deployNote && (
            <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100">
              <div className="text-xs font-medium text-neutral-600 mb-1">发布说明：</div>
              <p className="text-xs text-neutral-700">{expandedDeploy.deployNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ComplaintTab() {
  const navigate = useNavigate();
  const getComplaintSignatures = useDataStore((s) => s.getComplaintSignatures);

  const complaintSignatures = useMemo(() => {
    return getComplaintSignatures();
  }, [getComplaintSignatures]);

  const columns = [
    {
      key: 'customerName',
      title: '顾客',
      width: '140px',
      render: (row: SignatureRecord) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-danger-400 to-danger-600 flex items-center justify-center">
            <User size={10} className="text-white" />
          </div>
          <span className="text-sm text-neutral-800 font-medium">
            {maskName(row.customerName)}
          </span>
        </div>
      ),
    },
    {
      key: 'projectName',
      title: '项目',
      width: '160px',
      render: (row: SignatureRecord) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <Tag size={11} className="text-primary-500 flex-shrink-0" />
          <span className="text-xs text-neutral-700 truncate" title={row.projectName}>
            {row.projectName}
          </span>
        </div>
      ),
    },
    {
      key: 'storeName',
      title: '门店',
      width: '140px',
      render: (row: SignatureRecord) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <Store size={11} className="text-primary-500 flex-shrink-0" />
          <span className="text-xs text-neutral-700 truncate">
            {row.storeName}
          </span>
        </div>
      ),
    },
    {
      key: 'templateVersion',
      title: '模板版本',
      width: '100px',
      align: 'center' as const,
      render: (row: SignatureRecord) => (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-sm">
          v{row.templateVersion}
        </span>
      ),
    },
    {
      key: 'signedAt',
      title: '签署时间',
      width: '160px',
      align: 'center' as const,
      render: (row: SignatureRecord) => (
        <div className="flex items-center justify-center gap-1">
          <Clock size={12} className="text-neutral-400" />
          <span className="text-xs text-neutral-600">{formatDate(row.signedAt)}</span>
        </div>
      ),
    },
    {
      key: 'complaintType',
      title: '投诉类型',
      width: '100px',
      align: 'center' as const,
      render: (row: SignatureRecord) => {
        const detail = getComplaintDetail(row.id, row.signedAt, row.paragraphReadings);
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] bg-danger-50 text-danger-700 border border-danger-200 rounded-sm">
            {detail?.complaintType || '-'}
          </span>
        );
      },
    },
    {
      key: 'handleStatus',
      title: '处理状态',
      width: '100px',
      align: 'center' as const,
      render: (row: SignatureRecord) => {
        const detail = getComplaintDetail(row.id, row.signedAt, row.paragraphReadings);
        return (
          <StatusBadge
            status={detail?.handleStatus === 'closed' ? 'approved' : 'pending'}
            label={detail?.handleStatusLabel || '-'}
          />
        );
      },
    },
    {
      key: 'action',
      title: '操作',
      width: '120px',
      align: 'center' as const,
      render: (row: SignatureRecord) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/signatures/${row.id}`);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200 rounded-sm transition-colors"
          >
            <Eye size={11} />
            查看详情
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-danger-600" />
          <h3 className="text-sm font-semibold text-neutral-800">涉诉签署档案</h3>
          <span className="text-[11px] text-danger-600 bg-danger-50 px-2 py-0.5 rounded-sm">
            {complaintSignatures.length} 条涉诉记录
          </span>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={complaintSignatures}
        rowKey="id"
        pageSize={10}
        stripe
        onRowClick={(row) => navigate(`/signatures/${row.id}`)}
        rowClassName={() => 'bg-danger-50/30'}
      />
    </div>
  );
}

function RiskTermsTab() {
  const navigate = useNavigate();
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);
  const getSignaturesByParagraphId = useDataStore((s) => s.getSignaturesByParagraphId);

  const topRiskTerms = useMemo(() => {
    return [...riskTermStats]
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 20);
  }, []);

  const expandedTerm = topRiskTerms.find((t) => t.paragraphId === expandedTermId);
  const relatedSignatures = useMemo(() => {
    if (!expandedTermId) return [];
    return getSignaturesByParagraphId(expandedTermId).slice(0, 5);
  }, [expandedTermId, getSignaturesByParagraphId]);

  const toggleExpand = (paragraphId: string) => {
    setExpandedTermId((prev) => (prev === paragraphId ? null : paragraphId));
  };

  const getRiskLevel = (avgDuration: number) => {
    if (avgDuration >= 90) return { label: '高风险', className: 'bg-danger-50 text-danger-700 border-danger-200', color: '#8B2635' };
    if (avgDuration >= 60) return { label: '中风险', className: 'bg-warning-50 text-warning-700 border-warning-200', color: '#E65100' };
    if (avgDuration >= 40) return { label: '低风险', className: 'bg-primary-50 text-primary-700 border-primary-200', color: '#B8860B' };
    return { label: '正常', className: 'bg-success-50 text-success-700 border-success-200', color: '#2E7D5B' };
  };

  const columns = [
    {
      key: 'paragraphTitle',
      title: '条款名称',
      width: '260px',
      render: (row: RiskTermStats) => {
        const risk = getRiskLevel(row.avgDuration);
        return (
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ShieldAlert
                size={12}
                className={cn('flex-shrink-0',
                  risk.className.includes('danger') ? 'text-danger-500' :
                  risk.className.includes('warning') ? 'text-warning-500' :
                  risk.className.includes('primary') ? 'text-primary-500' : 'text-success-500'
                )}
              />
              <span className="text-sm font-medium text-neutral-800 truncate" title={row.paragraphTitle}>
                {row.paragraphTitle}
              </span>
            </div>
            <span className={cn('inline-block text-[10px] px-1.5 py-0.5 rounded-sm border', risk.className)}>
              {risk.label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'templateName',
      title: '所属模板',
      width: '220px',
      render: (row: RiskTermStats) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <FileText size={12} className="text-primary-500 flex-shrink-0" />
          <span className="text-xs text-neutral-700 truncate" title={row.templateName}>
            {row.templateName}
          </span>
        </div>
      ),
    },
    {
      key: 'avgDuration',
      title: '平均停留(秒)',
      width: '130px',
      align: 'center' as const,
      render: (row: RiskTermStats) => {
        const risk = getRiskLevel(row.avgDuration);
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (row.avgDuration / 150) * 100)}%`,
                  backgroundColor: risk.color,
                }}
              />
            </div>
            <span
              className="text-sm font-semibold font-mono"
              style={{ color: risk.color }}
            >
              {row.avgDuration}
            </span>
          </div>
        );
      },
    },
    {
      key: 'signatureCount',
      title: '签署数',
      width: '90px',
      align: 'center' as const,
      render: (row: RiskTermStats) => (
        <span className="text-sm font-medium text-neutral-700 font-mono">
          {row.signatureCount}
        </span>
      ),
    },
    {
      key: 'complaintCount',
      title: '涉诉数',
      width: '90px',
      align: 'center' as const,
      render: (row: RiskTermStats) => {
        const count = Math.floor(row.signatureCount * 0.07);
        return (
          <span className={cn(
            'text-sm font-medium font-mono',
            count > 5 ? 'text-danger-600' : 'text-neutral-600'
          )}>
            {count}
          </span>
        );
      },
    },
    {
      key: 'action',
      title: '操作',
      width: '140px',
      align: 'center' as const,
      render: (row: RiskTermStats) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(row.paragraphId);
            }}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-sm transition-colors',
              expandedTermId === row.paragraphId
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200'
            )}
          >
            {expandedTermId === row.paragraphId ? (
              <>
                <ChevronDown size={11} />
                收起
              </>
            ) : (
              <>
                <Eye size={11} />
                查看关联签署
              </>
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-purple-600" />
          <h3 className="text-sm font-semibold text-neutral-800">TOP 高风险条款</h3>
          <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-sm">
            按平均停留时长降序
          </span>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={topRiskTerms}
        rowKey="paragraphId"
        pageSize={10}
        stripe
        onRowClick={(row) => toggleExpand(row.paragraphId)}
      />

      {expandedTerm && (
        <div className="mt-4 bg-white border border-purple-200 rounded-sm shadow-md overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-purple-100 flex items-center justify-center">
                <ShieldAlert size={18} className="text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-800">
                  「{expandedTerm.paragraphTitle}」关联签署记录
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  模板：{expandedTerm.templateName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setExpandedTermId(null)}
              className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">顾客姓名</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">项目名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">门店</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-600">模板版本</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-600">签署时间</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-600">该条款停留</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-600">涉诉</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {relatedSignatures.map((sig) => {
                  const reading = sig.paragraphReadings.find((p) => p.paragraphId === expandedTermId);
                  const hasComplaint = signatureHasComplaint(sig.id);
                  return (
                    <tr
                      key={sig.id}
                      className={cn(
                        'border-b border-neutral-100 last:border-b-0 transition-colors',
                        hasComplaint ? 'bg-danger-50/40' : 'hover:bg-neutral-50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <User size={10} className="text-white" />
                          </div>
                          <span className="text-sm text-neutral-800 font-medium">
                            {maskName(sig.customerName)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Tag size={11} className="text-primary-500" />
                          <span className="text-xs text-neutral-700 truncate max-w-[120px]" title={sig.projectName}>
                            {sig.projectName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Store size={11} className="text-primary-500" />
                          <span className="text-xs text-neutral-700 truncate max-w-[100px]">
                            {sig.storeName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-sm">
                          v{sig.templateVersion}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-xs text-neutral-700">
                          {formatDate(sig.signedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm font-mono',
                          (reading?.duration || 0) >= 90
                            ? 'bg-danger-100 text-danger-700'
                            : (reading?.duration || 0) >= 60
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-primary-50 text-primary-700'
                        )}>
                          {reading?.duration || 0}s
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasComplaint ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-danger-100 text-danger-700 rounded-sm">
                            <AlertTriangle size={11} />
                            <span className="text-[11px] font-medium">涉诉</span>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/signatures/${sig.id}`)}
                          className="text-primary-600 hover:text-primary-700 hover:underline text-xs font-medium inline-flex items-center gap-0.5"
                        >
                          查看详情
                          <ExternalLink size={10} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {relatedSignatures.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-neutral-400 text-sm">
                      暂无关联签署记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {relatedSignatures.length > 0 && (
            <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 text-center">
              <button
                onClick={() => navigate('/signatures')}
                className="text-primary-600 hover:text-primary-700 hover:underline text-xs font-medium inline-flex items-center gap-1"
              >
                查看全部关联签署
                <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
