import { useState, useMemo } from 'react';
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
  Shield,
  Users,
  FileText,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui/DataTable';
import {
  analyticsSummary,
  riskTermStats,
  resignStats,
  complaintAssociations,
  templates,
  RiskTermStats,
  ReSignStats,
  ComplaintAssociation,
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
  const topRiskData = useMemo(() => {
    return riskTermStats.slice(0, 20).map((stat) => ({
      ...stat,
      shortTitle: truncate(stat.paragraphTitle, 12),
      color: getRiskLevelColor(stat.avgDuration, stat.skipRate),
      riskLevel: getRiskLevelLabel(stat.avgDuration, stat.skipRate),
    }));
  }, []);

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
      width: '90px',
      align: 'center' as const,
      render: () => (
        <div className="flex items-center justify-center">
          <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200 rounded-sm transition-colors">
            <Eye size={11} />
            详情
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
            平均停留时间越长，通常表示条款越难理解或争议越多
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

      <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-4" style={{ height: '360px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topRiskData}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
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
            >
              {topRiskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
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
        />
      </div>
    </div>
  );
}

function ResignAnalysisTab() {
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
      render: () => (
        <div className="flex items-center justify-center gap-1.5">
          <button className="inline-flex items-center gap-0.5 px-2 py-1 text-[11px] text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200 rounded-sm transition-colors">
            <ChevronRight size={11} />
            明细
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
        />
      </div>
    </div>
  );
}

function ComplaintAnalysisTab() {
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
      render: () => (
        <div className="flex items-center justify-center gap-1.5">
          <button className="inline-flex items-center gap-0.5 px-2.5 py-1 text-[11px] text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200 rounded-sm transition-colors">
            <Eye size={11} />
            追溯
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
        />
      </div>
    </div>
  );
}
