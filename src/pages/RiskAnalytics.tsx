import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Activity,
  Clock,
  FileWarning,
  AlertTriangle,
  TrendingUp,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  AlertOctagon,
  Filter,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  Shield,
  Users,
  FileText,
  Tag,
  User,
  Store,
  X,
  ExternalLink,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui/DataTable';
import { useDataStore, signatureHasComplaint } from '@/store/dataStore';
import {
  analyticsSummary,
  riskTermStats,
  resignStats,
  complaintAssociations,
  templates,
  RiskTermStats,
  ReSignStats,
  ComplaintAssociation,
  SignatureRecord,
} from '@/data/localMock';

type TabType = 'dwell' | 'resign' | 'complaint';

const COLORS = ['#1E3A5F', '#8B2635', '#B8860B', '#2E7D5B', '#7B4B94', '#2D7DD2', '#E65100', '#5D4037'];

const PIE_COLORS = ['#1E3A5F', '#476395', '#6E8AB4', '#9FB3CF', '#C9D5E5', '#E8EEF5'];

function truncate(text: string, maxLen: number = 14): string {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
}

function getRiskLevelColor(avgDuration: number, skipRate: number): string {
  if (avgDuration >= 90 || skipRate >= 12) return '#8B2635';
  if (avgDuration >= 60 || skipRate >= 8) return '#E65100';
  if (avgDuration >= 40 || skipRate >= 5) return '#B8860B';
  return '#1E3A5F';
}

function getRiskLevelLabel(avgDuration: number, skipRate: number): { label: string; className: string } {
  if (avgDuration >= 90 || skipRate >= 12) {
    return { label: '高风险', className: 'bg-danger-50 text-danger-700 border-danger-200' };
  }
  if (avgDuration >= 60 || skipRate >= 8) {
    return { label: '中风险', className: 'bg-warning-50 text-warning-700 border-warning-200' };
  }
  if (avgDuration >= 40 || skipRate >= 5) {
    return { label: '低风险', className: 'bg-primary-50 text-primary-700 border-primary-200' };
  }
  return { label: '正常', className: 'bg-success-50 text-success-700 border-success-200' };
}

function maskName(name: string): string {
  if (!name || name.length <= 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

function formatDateTime(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.toLocaleDateString('zh-CN')} ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function RiskAnalytics() {
  const [activeTab, setActiveTab] = useState<TabType>('dwell');

  const kpiData = useMemo(() => {
    return [
      {
        title: '近30天签署总数',
        value: analyticsSummary.totalSignatures,
        unit: '份',
        trend: 12.5,
        trendUp: true,
        icon: FileText,
        gradient: 'from-primary-500 to-primary-700',
        lightBg: 'from-primary-50 to-white',
        iconBg: 'bg-primary-100',
        iconColor: 'text-primary-600',
        border: 'border-primary-200',
      },
      {
        title: '平均阅读时长',
        value: analyticsSummary.avgReadingTime,
        unit: '秒',
        trend: 8.3,
        trendUp: true,
        icon: Clock,
        gradient: 'from-success-500 to-success-700',
        lightBg: 'from-success-50 to-white',
        iconBg: 'bg-success-100',
        iconColor: 'text-success-600',
        border: 'border-success-200',
      },
      {
        title: '补签率',
        value: analyticsSummary.resignRate,
        unit: '%',
        trend: 2.1,
        trendUp: false,
        icon: FileWarning,
        gradient: 'from-warning-500 to-warning-700',
        lightBg: 'from-warning-50 to-white',
        iconBg: 'bg-warning-100',
        iconColor: 'text-warning-600',
        border: 'border-warning-200',
      },
      {
        title: '客诉数量',
        value: analyticsSummary.complaintCount,
        unit: '起',
        trend: 10.0,
        trendUp: false,
        icon: AlertTriangle,
        gradient: 'from-danger-500 to-danger-700',
        lightBg: 'from-danger-50 to-white',
        iconBg: 'bg-danger-100',
        iconColor: 'text-danger-600',
        border: 'border-danger-200',
      },
    ];
  }, []);

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-1">风险统计看板</h1>
          <p className="text-sm text-neutral-500">
            多维度分析签署行为数据，识别高风险条款与项目，辅助合规决策
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-sm">
            <Filter size={12} className="text-neutral-500" />
            <span className="text-neutral-700">近30天</span>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white bg-primary-500 hover:bg-primary-600 rounded-sm transition-colors shadow-sm">
            <Download size={12} />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpiData.map((kpi, idx) => (
          <div
            key={idx}
            className={cn(
              'relative bg-white border rounded-sm shadow-paper overflow-hidden bg-gradient-to-br',
              kpi.border,
              kpi.lightBg
            )}
          >
            <div
              className={cn(
                'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
                kpi.gradient
              )}
            />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-neutral-600 font-medium">{kpi.title}</div>
                </div>
                <div className={cn('w-10 h-10 rounded-sm flex items-center justify-center', kpi.iconBg)}>
                  <kpi.icon size={18} className={kpi.iconColor} />
                </div>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold text-neutral-800">{kpi.value}</span>
                <span className="text-sm text-neutral-500 pb-1">{kpi.unit}</span>
              </div>
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium',
                    kpi.trendUp
                      ? 'bg-success-50 text-success-700'
                      : (kpi.title === '补签率' || kpi.title === '客诉数量')
                      ? 'bg-success-50 text-success-700'
                      : 'bg-danger-50 text-danger-700'
                  )}
                >
                  {(kpi.trendUp || kpi.title === '补签率' || kpi.title === '客诉数量') ? (
                    (kpi.title === '补签率' || kpi.title === '客诉数量') && !kpi.trendUp ? (
                      <ArrowDownRight size={10} />
                    ) : (
                      <ArrowUpRight size={10} />
                    )
                  ) : (
                    <ArrowDownRight size={10} />
                  )}
                  {kpi.trend}%
                  <span className="text-neutral-500 ml-0.5 font-normal">环比</span>
                </div>
                <span className="text-[10px] text-neutral-400">vs 上月同期</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm shadow-paper overflow-hidden">
        <div className="flex items-center border-b border-neutral-200 px-4 bg-neutral-50/50">
          <button
            onClick={() => setActiveTab('dwell')}
            className={cn(
              'px-6 py-4 text-sm font-medium relative transition-colors flex items-center gap-2',
              activeTab === 'dwell'
                ? 'text-primary-600'
                : 'text-neutral-600 hover:text-neutral-800'
            )}
          >
            <BarChart3 size={15} />
            条款停留分析
            {activeTab === 'dwell' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('resign')}
            className={cn(
              'px-6 py-4 text-sm font-medium relative transition-colors flex items-center gap-2',
              activeTab === 'resign'
                ? 'text-primary-600'
                : 'text-neutral-600 hover:text-neutral-800'
            )}
          >
            <PieChartIcon size={15} />
            补签率分析
            {activeTab === 'resign' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('complaint')}
            className={cn(
              'px-6 py-4 text-sm font-medium relative transition-colors flex items-center gap-2',
              activeTab === 'complaint'
                ? 'text-primary-600'
                : 'text-neutral-600 hover:text-neutral-800'
            )}
          >
            <AlertOctagon size={15} />
            客诉关联
            <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-medium rounded-full bg-danger-500 text-white ml-1">
              {complaintAssociations.length}
            </span>
            {activeTab === 'complaint' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
        </div>

        {activeTab === 'dwell' && <DwellAnalysisTab />}
        {activeTab === 'resign' && <ResignAnalysisTab />}
        {activeTab === 'complaint' && <ComplaintAnalysisTab />}
      </div>
    </div>
  );
}

function DwellAnalysisTab() {
  const navigate = useNavigate();
  const getSignaturesByParagraphId = useDataStore(s => s.getSignaturesByParagraphId);
  const [expandedParagraphId, setExpandedParagraphId] = useState<string | null>(null);

  const topRiskData = useMemo(() => {
    return riskTermStats.slice(0, 20).map((stat) => ({
      ...stat,
      shortTitle: truncate(stat.paragraphTitle, 12),
      color: getRiskLevelColor(stat.avgDuration, stat.skipRate),
      riskLevel: getRiskLevelLabel(stat.avgDuration, stat.skipRate),
    }));
  }, []);

  const expandedTerm = topRiskData.find(t => t.paragraphId === expandedParagraphId);
  const relatedSignatures = useMemo(() => {
    if (!expandedParagraphId) return [];
    return getSignaturesByParagraphId(expandedParagraphId);
  }, [expandedParagraphId, getSignaturesByParagraphId]);

  const signatureStats = useMemo(() => {
    if (relatedSignatures.length === 0) {
      return { total: 0, avgDuration: 0, complaintCount: 0 };
    }
    const durations = relatedSignatures.map(s => {
      const reading = s.paragraphReadings.find(p => p.paragraphId === expandedParagraphId);
      return reading?.duration || 0;
    });
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const complaintCount = relatedSignatures.filter(s => signatureHasComplaint(s.id)).length;
    return { total: relatedSignatures.length, avgDuration, complaintCount };
  }, [relatedSignatures, expandedParagraphId]);

  const displaySignatures = useMemo(() => {
    return relatedSignatures.slice(0, 10);
  }, [relatedSignatures]);

  const toggleExpand = (paragraphId: string) => {
    setExpandedParagraphId(prev => prev === paragraphId ? null : paragraphId);
  };

  const handleBarClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload) {
      toggleExpand(data.activePayload[0].payload.paragraphId);
    }
  };

  const columns = [
    {
      key: 'paragraphTitle',
      title: '条款名称',
      width: '240px',
      render: (row: (typeof topRiskData)[number]) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Shield size={12} className={cn('flex-shrink-0',
              row.riskLevel.className.includes('danger') ? 'text-danger-500' :
              row.riskLevel.className.includes('warning') ? 'text-warning-500' :
              row.riskLevel.className.includes('primary') ? 'text-primary-500' : 'text-success-500'
            )} />
            <span className="text-sm font-medium text-neutral-800 truncate" title={row.paragraphTitle}>
              {row.paragraphTitle}
            </span>
          </div>
          <span className={cn(
            'inline-block text-[10px] px-1.5 py-0.5 rounded-sm border',
            row.riskLevel.className
          )}>
            {row.riskLevel.label}
          </span>
        </div>
      ),
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
      width: '120px',
      align: 'center' as const,
      render: (row: (typeof topRiskData)[number]) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-14 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (row.avgDuration / 150) * 100)}%`,
                backgroundColor: row.color,
              }}
            />
          </div>
          <span
            className="text-sm font-semibold font-mono"
            style={{ color: row.color }}
          >
            {row.avgDuration}
          </span>
        </div>
      ),
    },
    {
      key: 'reviewCount',
      title: '回看次数',
      width: '100px',
      align: 'center' as const,
      render: (row: RiskTermStats) => (
        <div className="flex items-center justify-center gap-1">
          <Activity size={12} className="text-warning-500" />
          <span className="text-sm font-medium text-neutral-700">{row.reviewCount}</span>
        </div>
      ),
    },
    {
      key: 'skipRate',
      title: '跳出率',
      width: '120px',
      align: 'center' as const,
      render: (row: (typeof topRiskData)[number]) => {
        const rate = row.skipRate;
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="w-14 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  rate >= 12
                    ? 'bg-danger-500'
                    : rate >= 8
                    ? 'bg-warning-500'
                    : rate >= 5
                    ? 'bg-primary-500'
                    : 'bg-success-500'
                )}
                style={{ width: `${Math.min(100, rate * 5)}%` }}
              />
            </div>
            <span
              className={cn(
                'text-sm font-semibold',
                rate >= 12
                  ? 'text-danger-600'
                  : rate >= 8
                  ? 'text-warning-600'
                  : rate >= 5
                  ? 'text-primary-600'
                  : 'text-success-600'
              )}
            >
              {rate.toFixed(1)}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'signatureCount',
      title: '样本数',
      width: '90px',
      align: 'center' as const,
      render: (row: RiskTermStats) => (
        <span className="text-xs text-neutral-600 font-mono text-center block">
          n={row.signatureCount}
        </span>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: '130px',
      align: 'center' as const,
      render: (row: RiskTermStats) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(row.paragraphId);
            }}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-sm transition-colors',
              expandedParagraphId === row.paragraphId
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200'
            )}
          >
            {expandedParagraphId === row.paragraphId ? (
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-neutral-800">TOP 20 高停留风险条款</h3>
          <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-sm">
            点击柱状图或表格行查看关联签署记录
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#1E3A5F]" />
            <span className="text-neutral-600">正常</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#B8860B]" />
            <span className="text-neutral-600">低风险</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#E65100]" />
            <span className="text-neutral-600">中风险</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#8B2635]" />
            <span className="text-neutral-600">高风险</span>
          </div>
        </div>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-4 cursor-pointer" style={{ height: '360px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topRiskData}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
            <XAxis
              dataKey="shortTitle"
              tick={{ fontSize: 10, fill: '#757575' }}
              angle={-35}
              textAnchor="end"
              height={60}
              interval={0}
              axisLine={{ stroke: '#E0E0E0' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#757575' }}
              axisLine={{ stroke: '#E0E0E0' }}
              label={{
                value: '平均停留秒数',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 11, fill: '#757575' },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value}s`, '平均停留']}
              labelFormatter={(label, payload) => {
                const item = payload?.[0]?.payload;
                return item?.paragraphTitle || label;
              }}
            />
            <Bar
              dataKey="avgDuration"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
              cursor="pointer"
            >
              {topRiskData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={expandedParagraphId && expandedParagraphId !== entry.paragraphId ? 0.5 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-neutral-800">条款维度详细数据表</h3>
          </div>
          <span className="text-[11px] text-neutral-500">数据来源：/api/analytics/top-risk-sections</span>
        </div>
        <DataTable
          columns={columns}
          data={topRiskData}
          rowKey="paragraphId"
          pageSize={8}
          stripe
          onRowClick={(row) => toggleExpand(row.paragraphId)}
        />
      </div>

      {expandedTerm && (
        <div className="bg-white border border-primary-200 rounded-sm shadow-md overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-primary-50 to-white border-b border-primary-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-primary-100 flex items-center justify-center">
                <FileCheck size={18} className="text-primary-600" />
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
              onClick={() => setExpandedParagraphId(null)}
              className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 px-5 py-4 bg-neutral-50/50 border-b border-neutral-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-700 font-mono">{signatureStats.total}</div>
              <div className="text-xs text-neutral-500 mt-1">签署记录总数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600 font-mono">{signatureStats.avgDuration}s</div>
              <div className="text-xs text-neutral-500 mt-1">平均停留时长</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-600 font-mono">{signatureStats.complaintCount}</div>
              <div className="text-xs text-neutral-500 mt-1">涉诉记录数</div>
            </div>
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
                {displaySignatures.map((sig) => {
                  const reading = sig.paragraphReadings.find(p => p.paragraphId === expandedParagraphId);
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
                          {formatDateTime(sig.signedAt)}
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
                {displaySignatures.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-neutral-400 text-sm">
                      暂无关联签署记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {relatedSignatures.length > 10 && (
            <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 text-center">
              <button
                onClick={() => navigate('/signatures')}
                className="text-primary-600 hover:text-primary-700 hover:underline text-xs font-medium inline-flex items-center gap-1"
              >
                查看全部 {relatedSignatures.length} 条记录
                <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResignAnalysisTab() {
  const navigate = useNavigate();
  const signatures = useDataStore(s => s.signatures);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const pieData = useMemo(() => {
    return resignStats.slice(0, 8).map((stat, idx) => ({
      name: stat.projectName,
      value: stat.resignedCount || Math.max(1, Math.round(stat.totalSignatures * stat.resignRate / 100)),
      rate: stat.resignRate,
      total: stat.totalSignatures,
      fill: PIE_COLORS[idx % PIE_COLORS.length],
    }));
  }, []);

  const trendData = useMemo(() => {
    const months = ['2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
    return months.map((month, idx) => ({
      month: month.slice(5) + '月',
      补签率: Number((5 + Math.sin(idx * 0.8) * 2 + Math.random() * 1.5).toFixed(2)),
      正常率: Number((95 - Math.sin(idx * 0.8) * 2 - Math.random() * 1.5).toFixed(2)),
    }));
  }, []);

  const expandedProject = resignStats.find(s => s.projectId === expandedProjectId);

  const projectResignRecords = useMemo(() => {
    if (!expandedProjectId) return [];
    return signatures
      .filter(s => s.projectId === expandedProjectId && s.status === 'resigned')
      .sort((a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime())
      .slice(0, 5);
  }, [expandedProjectId, signatures]);

  const relatedTemplates = useMemo(() => {
    if (!expandedProjectId) return [];
    const tmplSet = new Set<string>();
    signatures
      .filter(s => s.projectId === expandedProjectId)
      .forEach(s => tmplSet.add(`${s.templateName}|v${s.templateVersion}`));
    return Array.from(tmplSet).slice(0, 3);
  }, [expandedProjectId, signatures]);

  const toggleExpand = (projectId: string) => {
    setExpandedProjectId(prev => prev === projectId ? null : projectId);
  };

  const resignReasons = [
    '信息填写错误',
    '身份证号有误',
    '漏看风险条款',
    '签名不清晰',
    '需要补充告知',
  ];

  const columns = [
    {
      key: 'projectName',
      title: '项目名称',
      width: '200px',
      render: (row: ReSignStats) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[resignStats.indexOf(row) % COLORS.length] }} />
          <Tag size={12} className="text-primary-500 flex-shrink-0" />
          <span className="text-sm font-medium text-neutral-800 truncate">{row.projectName}</span>
        </div>
      ),
    },
    {
      key: 'totalSignatures',
      title: '签署总数',
      width: '110px',
      align: 'center' as const,
      render: (row: ReSignStats) => (
        <div className="flex items-center justify-center gap-1.5">
          <Users size={12} className="text-primary-500" />
          <span className="text-sm font-semibold text-neutral-700 font-mono">{row.totalSignatures}</span>
        </div>
      ),
    },
    {
      key: 'resignedCount',
      title: '补签数',
      width: '100px',
      align: 'center' as const,
      render: (row: ReSignStats) => (
        <div className="flex items-center justify-center gap-1.5">
          <FileWarning size={12} className="text-warning-500" />
          <span className="text-sm font-semibold text-warning-700 font-mono">{row.resignedCount}</span>
        </div>
      ),
    },
    {
      key: 'resignRate',
      title: '补签率',
      width: '180px',
      align: 'center' as const,
      render: (row: ReSignStats) => {
        const rate = row.resignRate;
        return (
          <div className="flex items-center justify-center gap-3">
            <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  rate >= 12
                    ? 'bg-danger-500'
                    : rate >= 8
                    ? 'bg-warning-500'
                    : rate >= 5
                    ? 'bg-primary-500'
                    : 'bg-success-500'
                )}
                style={{ width: `${Math.min(100, rate * 6)}%` }}
              />
            </div>
            <span
              className={cn(
                'text-sm font-bold font-mono w-12 text-right',
                rate >= 12
                  ? 'text-danger-600'
                  : rate >= 8
                  ? 'text-warning-600'
                  : rate >= 5
                  ? 'text-primary-600'
                  : 'text-success-600'
              )}
            >
              {rate}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'change',
      title: '较上月变化',
      width: '120px',
      align: 'center' as const,
      render: (row: ReSignStats) => {
        const change = Number((Math.random() * 6 - 3).toFixed(2));
        const isGood = row.resignRate >= 5 ? change < 0 : change > 0;
        return (
          <div className="flex items-center justify-center gap-1">
            {change > 0 ? (
              <ArrowUpRight size={14} className={isGood ? 'text-success-500' : 'text-danger-500'} />
            ) : (
              <ArrowDownRight size={14} className={isGood ? 'text-success-500' : 'text-danger-500'} />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                isGood ? 'text-success-600' : 'text-danger-600'
              )}
            >
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'action',
      title: '操作',
      width: '100px',
      align: 'center' as const,
      render: (row: ReSignStats) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(row.projectId);
            }}
            className={cn(
              'inline-flex items-center gap-0.5 px-2 py-1 text-[11px] rounded-sm transition-colors',
              expandedProjectId === row.projectId
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200'
            )}
          >
            {expandedProjectId === row.projectId ? (
              <>
                <ChevronDown size={11} />
                收起
              </>
            ) : (
              <>
                <ChevronRight size={11} />
                明细
              </>
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon size={15} className="text-primary-600" />
              <h3 className="text-sm font-semibold text-neutral-800">项目补签率排行</h3>
            </div>
            <span className="text-[11px] text-neutral-500">TOP 8 项目</span>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={1}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: 12,
                  }}
                  formatter={(value: number, _name, props) => [
                    `${value} 件 (${props.payload.rate}%)`,
                    '补签数',
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="square"
                  iconSize={10}
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => (
                    <span className="text-xs text-neutral-600" style={{ maxWidth: '100px' }}>
                      {truncate(value, 8)}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-warning-600" />
              <h3 className="text-sm font-semibold text-neutral-800">近30天补签率趋势</h3>
            </div>
            <span className="text-[11px] text-neutral-500">单位：%</span>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#757575' }}
                  axisLine={{ stroke: '#E0E0E0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#757575' }}
                  axisLine={{ stroke: '#E0E0E0' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                <Legend
                  iconType="line"
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="补签率"
                  stroke="#B8860B"
                  strokeWidth={2.5}
                  dot={{ fill: '#B8860B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="正常率"
                  stroke="#2E7D5B"
                  strokeWidth={2.5}
                  dot={{ fill: '#2E7D5B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-neutral-800">项目维度补签统计表</h3>
          </div>
          <span className="text-[11px] text-neutral-500">
            数据来源：/api/analytics/resign-stats
          </span>
        </div>
        <DataTable
          columns={columns}
          data={resignStats}
          rowKey="projectId"
          pageSize={8}
          stripe
          onRowClick={(row) => toggleExpand(row.projectId)}
        />
      </div>

      {expandedProject && (
        <div className="bg-white border border-warning-200 rounded-sm shadow-md overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-warning-50 to-white border-b border-warning-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-warning-100 flex items-center justify-center">
                <FileWarning size={18} className="text-warning-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-800">
                  「{expandedProject.projectName}」补签详情
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  项目补签记录与统计分析
                </p>
              </div>
            </div>
            <button
              onClick={() => setExpandedProjectId(null)}
              className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 px-5 py-4 bg-neutral-50/50 border-b border-neutral-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-700 font-mono">{expandedProject.totalSignatures}</div>
              <div className="text-xs text-neutral-500 mt-1">总签署数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600 font-mono">{expandedProject.resignedCount}</div>
              <div className="text-xs text-neutral-500 mt-1">补签数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-600 font-mono">{expandedProject.resignRate}%</div>
              <div className="text-xs text-neutral-500 mt-1">补签率</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary-600">
                {relatedTemplates.length} <span className="text-sm font-normal">个</span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">关联模板版本</div>
            </div>
          </div>

          {relatedTemplates.length > 0 && (
            <div className="px-5 py-3 border-b border-neutral-100 bg-white">
              <div className="text-xs font-medium text-neutral-600 mb-2">关联模板版本：</div>
              <div className="flex flex-wrap gap-2">
                {relatedTemplates.map((t, idx) => {
                  const [name, version] = t.split('|');
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-primary-50 text-primary-700 border border-primary-200 rounded-sm"
                    >
                      <FileText size={10} />
                      {truncate(name, 12)}
                      <span className="font-mono">{version}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="px-5 py-3 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-warning-500" />
              <span className="text-sm font-semibold text-neutral-700">最近 5 条补签记录</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">顾客姓名</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">门店</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-600">模板版本</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-600">补签时间</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">补签原因</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {projectResignRecords.map((sig, idx) => (
                  <tr
                    key={sig.id}
                    className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center">
                          <User size={10} className="text-white" />
                        </div>
                        <span className="text-sm text-neutral-800 font-medium">
                          {maskName(sig.customerName)}
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
                        {formatDateTime(sig.signedAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 text-[11px] bg-warning-50 text-warning-700 border border-warning-200 rounded-sm">
                        {resignReasons[idx % resignReasons.length]}
                      </span>
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
                ))}
                {projectResignRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-neutral-400 text-sm">
                      暂无补签记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 text-center">
            <button
              onClick={() => navigate('/signatures?status=resigned')}
              className="text-primary-600 hover:text-primary-700 hover:underline text-xs font-medium inline-flex items-center gap-1"
            >
              查看全部补签记录
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ComplaintAnalysisTab() {
  const navigate = useNavigate();
  const signatures = useDataStore(s => s.signatures);
  const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>(null);

  const expandedComplaint = complaintAssociations.find(c => c.id === expandedComplaintId);

  const relatedComplaintSignatures = useMemo(() => {
    if (!expandedComplaint) return [];
    return signatures
      .filter(s => s.projectId === expandedComplaint.projectId && signatureHasComplaint(s.id))
      .sort((a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime())
      .slice(0, 10);
  }, [expandedComplaint, signatures]);

  const toggleExpand = (id: string) => {
    setExpandedComplaintId(prev => prev === id ? null : id);
  };

  const columns = [
    {
      key: 'index',
      title: '序号',
      width: '60px',
      align: 'center' as const,
      render: (_row: ComplaintAssociation, index: number) => (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-danger-50 text-danger-700 text-xs font-bold">
          {index + 1}
        </span>
      ),
    },
    {
      key: 'projectName',
      title: '发生客诉的项目',
      width: '180px',
      render: (row: ComplaintAssociation) => (
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle size={14} className="text-danger-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-neutral-800 truncate">{row.projectName}</span>
        </div>
      ),
    },
    {
      key: 'templateVersion',
      title: '对应模板版本号',
      width: '180px',
      render: (row: ComplaintAssociation) => {
        const tmpl = templates.find((t) => t.id === row.templateId);
        return (
          <div className="min-w-0">
            <div className="text-xs text-neutral-700 font-medium truncate" title={tmpl?.name}>
              {tmpl?.name || '未知模板'}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-primary-50 text-primary-700 border border-primary-200 rounded-sm">
                v{row.templateVersionId.slice(-3).replace('_', '.')}
              </span>
              <span className="text-[10px] text-neutral-500">
                TID: {row.templateId.toUpperCase()}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'relatedSections',
      title: '主要涉及条款',
      width: '280px',
      render: (row: ComplaintAssociation) => {
        const sections = [row.paragraphTitle, '可能出现的风险与并发症', '术后护理须知'];
        return (
          <div className="flex flex-wrap gap-1.5">
            {sections.slice(0, 3).map((s, idx) => (
              <span
                key={idx}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-sm border',
                  idx === 0
                    ? 'bg-danger-50 text-danger-700 border-danger-200'
                    : idx === 1
                    ? 'bg-warning-50 text-warning-700 border-warning-200'
                    : 'bg-primary-50 text-primary-700 border-primary-200'
                )}
              >
                <Shield size={9} />
                {truncate(s, 10)}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'count',
      title: '客诉数量',
      width: '120px',
      align: 'center' as const,
      render: (row: ComplaintAssociation) => (
        <div className="flex items-center justify-center gap-2">
          <div className="flex">
            {Array.from({ length: Math.min(row.complaintCount, 5) }).map((_, i) => (
              <AlertOctagon
                key={i}
                size={14}
                className="text-danger-500 -ml-0.5 first:ml-0"
                fill="#F2E5E8"
              />
            ))}
          </div>
          <span className="text-lg font-bold text-danger-700 font-mono">{row.complaintCount}</span>
        </div>
      ),
    },
    {
      key: 'rate',
      title: '涉诉比例',
      width: '130px',
      align: 'center' as const,
      render: (row: ComplaintAssociation) => {
        const rate = Number(((row.complaintCount / row.associatedSignatures) * 100).toFixed(2));
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-danger-500 rounded-full"
                style={{ width: `${Math.min(100, rate * 15)}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-danger-600 font-mono">{rate}%</span>
          </div>
        );
      },
    },
    {
      key: 'sample',
      title: '关联签署数',
      width: '100px',
      align: 'center' as const,
      render: (row: ComplaintAssociation) => (
        <span className="text-xs text-neutral-600 font-mono text-center block">
          n={row.associatedSignatures}
        </span>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: '100px',
      align: 'center' as const,
      render: (row: ComplaintAssociation) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(row.id);
            }}
            className={cn(
              'inline-flex items-center gap-0.5 px-2.5 py-1 text-[11px] rounded-sm transition-colors',
              expandedComplaintId === row.id
                ? 'bg-danger-100 text-danger-700 border border-danger-300'
                : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200'
            )}
          >
            {expandedComplaintId === row.id ? (
              <>
                <ChevronDown size={11} />
                收起
              </>
            ) : (
              <>
                <Eye size={11} />
                追溯
              </>
            )}
          </button>
        </div>
      ),
    },
  ];

  const summaryStats = useMemo(() => {
    const totalComplaints = complaintAssociations.reduce((s, c) => s + c.complaintCount, 0);
    const affectedProjects = complaintAssociations.length;
    const highRiskSections = complaintAssociations.length;
    const avgRate = complaintAssociations.length > 0
      ? (complaintAssociations.reduce((s, c) => s + (c.complaintCount / c.associatedSignatures), 0) / complaintAssociations.length * 100).toFixed(2)
      : '0';
    return [
      {
        label: '累计客诉总量',
        value: totalComplaints,
        unit: '起',
        color: 'danger',
      },
      {
        label: '涉诉项目数',
        value: affectedProjects,
        unit: '个',
        color: 'warning',
      },
      {
        label: '高风险条款数',
        value: highRiskSections,
        unit: '条',
        color: 'primary',
      },
      {
        label: '平均涉诉率',
        value: avgRate,
        unit: '%',
        color: 'neutral',
      },
    ];
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {summaryStats.map((stat, idx) => {
          const colorMap = {
            danger: {
              bg: 'from-danger-50 to-white',
              border: 'border-danger-200',
              iconBg: 'bg-danger-100',
              iconColor: 'text-danger-600',
              text: 'text-danger-700',
            },
            warning: {
              bg: 'from-warning-50 to-white',
              border: 'border-warning-200',
              iconBg: 'bg-warning-100',
              iconColor: 'text-warning-600',
              text: 'text-warning-700',
            },
            primary: {
              bg: 'from-primary-50 to-white',
              border: 'border-primary-200',
              iconBg: 'bg-primary-100',
              iconColor: 'text-primary-600',
              text: 'text-primary-700',
            },
            neutral: {
              bg: 'from-neutral-50 to-white',
              border: 'border-neutral-200',
              iconBg: 'bg-neutral-100',
              iconColor: 'text-neutral-600',
              text: 'text-neutral-700',
            },
          };
          const c = colorMap[stat.color as keyof typeof colorMap];
          const IconComponent = stat.color === 'danger' ? AlertTriangle : stat.color === 'warning' ? FileWarning : stat.color === 'primary' ? Shield : Activity;
          return (
            <div
              key={idx}
              className={cn(
                'p-4 rounded-sm border shadow-paper bg-gradient-to-br',
                c.bg,
                c.border
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600">{stat.label}</span>
                <div className={cn('w-8 h-8 rounded-sm flex items-center justify-center', c.iconBg)}>
                  <IconComponent size={14} className={c.iconColor} />
                </div>
              </div>
              <div className="flex items-end gap-1.5 mt-3">
                <span className={cn('text-2xl font-bold', c.text)}>{stat.value}</span>
                <span className="text-xs text-neutral-500 pb-1">{stat.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-danger-50/50 border border-danger-200 rounded-sm p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertOctagon size={16} className="text-danger-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-danger-800 mb-1">
            交叉分析结论与合规建议
          </div>
          <p className="text-xs text-danger-700 leading-relaxed">
            分析显示，
            <span className="font-semibold underline">手术类项目（吸脂、隆鼻）</span>
            客诉率显著高于非手术类，主要集中在
            <span className="font-semibold">「可能出现的风险与并发症」</span>
            条款理解不充分。建议：1) 增加手术类项目强制阅读时长至8分钟以上；
            2) 对高风险条款增加语音讲解并二次确认机制；
            3) 组织医师专项培训，确保术前充分告知。
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon size={16} className="text-danger-600" />
            <h3 className="text-sm font-semibold text-neutral-800">客诉关联交叉分析表</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-500">
              数据来源：/api/analytics/complaint-associations
            </span>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-danger-500 hover:bg-danger-600 rounded-sm transition-colors shadow-sm">
              <FileSpreadsheet size={12} />
              导出分析报表
            </button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={complaintAssociations}
          rowKey="id"
          pageSize={10}
          stripe
          onRowClick={(row) => toggleExpand(row.id)}
        />
      </div>

      {expandedComplaint && (
        <div className="bg-white border border-danger-200 rounded-sm shadow-md overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-danger-50 to-white border-b border-danger-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-danger-100 flex items-center justify-center">
                <AlertOctagon size={18} className="text-danger-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-800">
                  「{expandedComplaint.projectName}」涉诉签署档案
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  主要涉及条款：{expandedComplaint.paragraphTitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setExpandedComplaintId(null)}
              className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 px-5 py-4 bg-danger-50/30 border-b border-danger-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-700 font-mono">{expandedComplaint.complaintCount}</div>
              <div className="text-xs text-neutral-500 mt-1">客诉数量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600 font-mono">
                {((expandedComplaint.complaintCount / expandedComplaint.associatedSignatures) * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-neutral-500 mt-1">涉诉比例</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 font-mono">{expandedComplaint.associatedSignatures}</div>
              <div className="text-xs text-neutral-500 mt-1">关联签署总数</div>
            </div>
          </div>

          <div className="px-5 py-3 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-danger-500" />
              <span className="text-sm font-semibold text-neutral-700">涉诉签署记录列表</span>
              <span className="text-xs text-danger-600 bg-danger-50 px-2 py-0.5 rounded-sm">
                红色标记为涉诉记录
              </span>
            </div>
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
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-600">阅读时长</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-600">涉诉标记</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {relatedComplaintSignatures.map((sig) => {
                  const hasComplaint = signatureHasComplaint(sig.id);
                  return (
                    <tr
                      key={sig.id}
                      className={cn(
                        'border-b border-neutral-100 last:border-b-0 transition-colors',
                        hasComplaint ? 'bg-danger-50/50' : 'hover:bg-neutral-50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center',
                            hasComplaint
                              ? 'bg-gradient-to-br from-danger-400 to-danger-600'
                              : 'bg-gradient-to-br from-primary-400 to-primary-600'
                          )}>
                            <User size={10} className="text-white" />
                          </div>
                          <span className={cn(
                            'text-sm font-medium',
                            hasComplaint ? 'text-danger-800' : 'text-neutral-800'
                          )}>
                            {maskName(sig.customerName)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Tag size={11} className="text-primary-500" />
                          <span className="text-xs text-neutral-700 truncate max-w-[100px]">
                            {sig.projectName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Store size={11} className="text-primary-500" />
                          <span className="text-xs text-neutral-700 truncate max-w-[90px]">
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
                          {formatDateTime(sig.signedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm font-mono',
                          sig.totalReadingTime < 60
                            ? 'bg-danger-100 text-danger-700'
                            : sig.totalReadingTime < 120
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-success-100 text-success-700'
                        )}>
                          {sig.totalReadingTime}s
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
                          查看档案
                          <ExternalLink size={10} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {relatedComplaintSignatures.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-neutral-400 text-sm">
                      暂无涉诉签署记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 text-center">
            <button
              onClick={() => navigate('/signatures')}
              className="text-primary-600 hover:text-primary-700 hover:underline text-xs font-medium inline-flex items-center gap-1"
            >
              查看全部签署记录
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
