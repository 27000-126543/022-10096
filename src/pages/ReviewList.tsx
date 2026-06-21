import { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  reviewRecords,
  templates,
  type ReviewRecord,
  type TemplateCategory,
} from '@/data/localMock';
import CategoryTag from '@/components/ui/CategoryTag';

type TabType = 'pending' | 'approved' | 'rejected';

const tabConfig: Record<
  TabType,
  { label: string; icon: typeof Clock; color: string; activeColor: string }
> = {
  pending: {
    label: '待审核',
    icon: Clock,
    color: 'text-warning-600',
    activeColor: 'bg-warning-50 border-warning-200 text-warning-700',
  },
  approved: {
    label: '已通过',
    icon: CheckCircle2,
    color: 'text-success-600',
    activeColor: 'bg-success-50 border-success-200 text-success-700',
  },
  rejected: {
    label: '已驳回',
    icon: XCircle,
    color: 'text-danger-600',
    activeColor: 'bg-danger-50 border-danger-200 text-danger-700',
  },
};

const categoryOptions: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部分类' },
  { value: 'injection', label: '注射类' },
  { value: 'skin', label: '皮肤类' },
  { value: 'plastic', label: '整形类' },
  { value: 'antiaging', label: '抗衰类' },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}

export default function ReviewList() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitterFilter, setSubmitterFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>(
    'all'
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const counts = useMemo(() => {
    return {
      pending: reviewRecords.filter((r) => r.status === 'pending').length,
      approved: reviewRecords.filter((r) => r.status === 'approved').length,
      rejected: reviewRecords.filter((r) => r.status === 'rejected').length,
    };
  }, []);

  const submitters = useMemo(() => {
    const set = new Set<string>(reviewRecords.map((r) => r.submitterName));
    return Array.from(set);
  }, []);

  const filteredRecords = useMemo(() => {
    return reviewRecords.filter((r) => {
      if (r.status !== activeTab) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const template = templates.find((t) => t.id === r.templateId);
        if (
          !r.templateName.toLowerCase().includes(q) &&
          !template?.tags.some((tag) => tag.toLowerCase().includes(q)) &&
          !r.changeSummary.toLowerCase().includes(q)
        )
          return false;
      }

      if (submitterFilter !== 'all' && r.submitterName !== submitterFilter)
        return false;

      if (categoryFilter !== 'all') {
        const template = templates.find((t) => t.id === r.templateId);
        if (template?.category !== categoryFilter) return false;
      }

      if (startDate) {
        const submitDate = new Date(r.submitTime);
        if (submitDate < new Date(startDate)) return false;
      }
      if (endDate) {
        const submitDate = new Date(r.submitTime);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        if (submitDate > end) return false;
      }

      return true;
    });
  }, [activeTab, searchQuery, submitterFilter, categoryFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewDetail = (record: ReviewRecord) => {
    console.log('View detail:', record.id);
  };

  const handleQuickApprove = (record: ReviewRecord) => {
    console.log('Quick approve:', record.id);
  };

  const handleReject = (record: ReviewRecord) => {
    console.log('Reject:', record.id);
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-neutral-200">
        <h1 className="text-lg font-semibold text-primary-800">版本审核管理</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          审核和管理知情同意书模板的版本更新申请
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 bg-white border-b border-neutral-200">
        <div className="flex items-center gap-2">
          {(Object.keys(tabConfig) as TabType[]).map((tab) => {
            const config = tabConfig[tab];
            const Icon = config.icon;
            const count = counts[tab];
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-sm border-b-2 transition-all -mb-px',
                  isActive
                    ? 'border-primary-500 text-primary-700 bg-primary-50/50'
                    : 'border-transparent text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                )}
              >
                <Icon size={16} className={isActive ? config.color : ''} />
                <span>{config.label}</span>
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 text-[11px] font-medium rounded-full',
                    isActive
                      ? tab === 'pending'
                        ? 'bg-warning-100 text-warning-700'
                        : tab === 'approved'
                        ? 'bg-success-100 text-success-700'
                        : 'bg-danger-100 text-danger-700'
                      : 'bg-neutral-100 text-neutral-600'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-4 bg-white border-b border-neutral-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-neutral-400" />
            <span className="text-xs text-neutral-500">筛选：</span>
          </div>

          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜索模板名称、变更内容..."
              className="w-64 pl-9 pr-4 py-1.5 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
            />
          </div>

          <select
            value={submitterFilter}
            onChange={(e) => {
              setSubmitterFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 bg-white"
          >
            <option value="all">全部提交人</option>
            {submitters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as TemplateCategory | 'all');
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 bg-white"
          >
            {categoryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-neutral-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
            />
            <span className="text-xs text-neutral-400">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
            />
          </div>

          {(searchQuery ||
            submitterFilter !== 'all' ||
            categoryFilter !== 'all' ||
            startDate ||
            endDate) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSubmitterFilter('all');
                setCategoryFilter('all');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="text-xs text-primary-600 hover:text-primary-700 underline underline-offset-2"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* Card List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-neutral-500">
            共 <span className="font-medium text-neutral-700">{filteredRecords.length}</span>{' '}
            条记录
          </p>
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-neutral-600 border border-neutral-200 rounded-sm hover:bg-neutral-50 transition-colors">
            <ArrowUpDown size={12} />
            按提交时间排序
          </button>
        </div>

        {paginatedRecords.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-sm py-20 text-center text-neutral-400">
            <Clock size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无{activeTab === 'pending' ? '待审核' : activeTab === 'approved' ? '已通过' : '已驳回'}的记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedRecords.map((record) => {
              const template = templates.find((t) => t.id === record.templateId);
              const config = tabConfig[activeTab];

              return (
                <div
                  key={record.id}
                  className="bg-white border border-neutral-200 rounded-sm shadow-paper hover:shadow-paper-hover transition-all p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base font-semibold text-neutral-800 truncate">
                          {record.templateName}
                        </h3>
                        {template && (
                          <CategoryTag
                            category={
                              (template.category === 'antiaging'
                                ? 'antiaging'
                                : template.category) as Parameters<
                                typeof CategoryTag
                              >[0]['category']
                            }
                            size="sm"
                          />
                        )}
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-medium rounded-sm bg-primary-50 text-primary-600 border border-primary-100">
                          v{record.version}
                        </span>
                      </div>

                      <div className="flex items-center gap-5 mt-3 text-xs text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[10px] font-medium">
                            {record.submitterName.slice(0, 1)}
                          </div>
                          <span>{record.submitterName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>{formatDate(record.submitTime)}</span>
                        </div>
                        {record.reviewerName && (
                          <div className="flex items-center gap-1.5">
                            <User size={12} />
                            <span>审核人：{record.reviewerName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-sm border',
                        config.activeColor
                      )}
                    >
                      <config.icon size={12} />
                      {config.label}
                    </span>
                  </div>

                  {/* Change Summary */}
                  <div className="mt-4 p-3 bg-neutral-50 border border-neutral-100 rounded-sm">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FileTextIcon />
                      <span className="text-xs font-medium text-neutral-600">
                        变更摘要
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                      {record.changeSummary}
                    </p>
                    {record.opinion && (
                      <div className="mt-2 pt-2 border-t border-neutral-200">
                        <span className="text-xs font-medium text-neutral-500">
                          {record.decision === 'approved' ? '审核意见：' : '驳回原因：'}
                        </span>
                        <span className="text-xs text-neutral-600">
                          {record.opinion}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleViewDetail(record)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-sm hover:bg-primary-100 hover:border-primary-300 transition-colors"
                    >
                      <Eye size={13} />
                      查看详情
                    </button>

                    {activeTab === 'pending' && (
                      <>
                        <button
                          onClick={() => handleQuickApprove(record)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-success-500 rounded-sm hover:bg-success-600 transition-colors"
                        >
                          <Check size={13} />
                          快速通过
                        </button>
                        <button
                          onClick={() => handleReject(record)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-danger-500 rounded-sm hover:bg-danger-600 transition-colors"
                        >
                          <X size={13} />
                          驳回
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <span className="text-xs text-neutral-500">
              第 {currentPage} / {totalPages} 页
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-sm border transition-colors',
                  currentPage === 1
                    ? 'border-neutral-200 text-neutral-300 cursor-not-allowed bg-neutral-50'
                    : 'border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50'
                )}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-sm border text-xs font-medium transition-colors',
                    p === currentPage
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50'
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-sm border transition-colors',
                  currentPage === totalPages
                    ? 'border-neutral-200 text-neutral-300 cursor-not-allowed bg-neutral-50'
                    : 'border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50'
                )}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileTextIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-neutral-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
