import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit3,
  History,
  Send,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  User,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryTag, type CategoryType } from '@/components/ui/CategoryTag';
import { StatusBadge, type StatusType } from '@/components/ui/StatusBadge';

const categoryTabs = [
  { key: 'all', label: '全部' },
  { key: 'injection', label: '注射', color: '#7B4B94' },
  { key: 'skin', label: '皮肤', color: '#2D7DD2' },
  { key: 'plastic', label: '整形', color: '#2E7D5B' },
  { key: 'antiaging', label: '抗衰', color: '#B8860B' },
];

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'reviewing', label: '审核中' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
  { value: 'published', label: '已发布' },
];

interface TemplateItem {
  id: string;
  name: string;
  category: CategoryType;
  status: StatusType;
  currentVersion: string;
  updatedAt: string;
  updatedBy: string;
  tags?: string[];
}

export default function TemplateList() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          category: activeCategory,
          status: activeStatus,
          keyword: searchKeyword,
          page: String(page),
          pageSize: String(pageSize),
        });
        const res = await fetch(`/api/templates?${params}`);
        const result = await res.json();
        if (result.success) {
          setTemplates(result.data || []);
          setTotal(result.total || 0);
        }
      } catch {
        const mockData: TemplateItem[] = [
          { id: 't001', name: '玻尿酸注射知情同意书', category: 'injection', status: 'published', currentVersion: 'V2.1.3', updatedAt: '2026-06-20 15:30', updatedBy: '李晓明' },
          { id: 't002', name: '肉毒素瘦脸针知情同意书', category: 'injection', status: 'reviewing', currentVersion: 'V3.0.1', updatedAt: '2026-06-21 10:15', updatedBy: '王慧敏' },
          { id: 't003', name: '光子嫩肤治疗知情同意书', category: 'skin', status: 'published', currentVersion: 'V1.2.0', updatedAt: '2026-06-18 14:20', updatedBy: '张建国' },
          { id: 't004', name: '热玛吉抗衰治疗知情同意书', category: 'antiaging', status: 'draft', currentVersion: 'V1.0.0', updatedAt: '2026-06-22 09:45', updatedBy: '赵晓峰' },
          { id: 't005', name: '双眼皮成形术知情同意书', category: 'plastic', status: 'approved', currentVersion: 'V1.5.2', updatedAt: '2026-06-19 16:00', updatedBy: '陈美玲' },
          { id: 't006', name: '鼻综合整形手术知情同意书', category: 'plastic', status: 'rejected', currentVersion: 'V2.0.0', updatedAt: '2026-06-20 11:30', updatedBy: '刘伟强' },
          { id: 't007', name: '水光针注射知情同意书', category: 'injection', status: 'published', currentVersion: 'V1.3.5', updatedAt: '2026-06-17 08:50', updatedBy: '孙丽娟' },
          { id: 't008', name: '线雕提升术知情同意书', category: 'antiaging', status: 'reviewing', currentVersion: 'V1.1.0', updatedAt: '2026-06-21 14:10', updatedBy: '周文杰' },
          { id: 't009', name: '点阵激光治疗知情同意书', category: 'skin', status: 'draft', currentVersion: 'V0.9.2', updatedAt: '2026-06-22 11:20', updatedBy: '吴海涛' },
        ];
        setTemplates(mockData);
        setTotal(47);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [activeCategory, activeStatus, searchKeyword, page, pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  const handleSubmitReview = (id: string) => {
    console.log('提交审核:', id);
  };

  const getActionButtons = (status: StatusType, id: string) => {
    const buttons: JSX.Element[] = [];

    if (['draft', 'rejected'].includes(status)) {
      buttons.push(
        <button
          key="edit"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          编辑
        </button>
      );
    }

    if (['draft', 'reviewing', 'approved', 'published'].includes(status)) {
      buttons.push(
        <button
          key="history"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          历史
        </button>
      );
    }

    if (['draft', 'rejected'].includes(status)) {
      buttons.push(
        <button
          key="submit"
          onClick={() => handleSubmitReview(id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-primary-500 hover:bg-primary-600 rounded transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          提交审核
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">模板库</h1>
          <p className="text-sm text-neutral-500 mt-1">管理各类医疗美容知情同意书模板</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          新建模板
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-paper p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-neutral-100 rounded-md p-1">
            {categoryTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveCategory(tab.key);
                  setPage(1);
                }}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium rounded transition-all',
                  activeCategory === tab.key
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                )}
                style={activeCategory === tab.key && tab.color ? { color: tab.color } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <select
                value={activeStatus}
                onChange={(e) => {
                  setActiveStatus(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-8 py-2 text-sm border border-neutral-200 rounded-md bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 appearance-none cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="搜索模板名称/编号..."
                className="w-64 pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 placeholder:text-neutral-400"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-500 pt-3 border-t border-neutral-100">
          <span>共 <b className="text-neutral-700">{total}</b> 条记录</span>
          <span className="text-neutral-300">|</span>
          <span>当前显示第 <b className="text-neutral-700">{(page - 1) * pageSize + 1}</b> - <b className="text-neutral-700">{Math.min(page * pageSize, total)}</b> 条</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-paper p-5 animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4" />
              <div className="h-6 bg-neutral-200 rounded w-4/5 mb-6" />
              <div className="h-3 bg-neutral-100 rounded w-full mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-3/4 mb-6" />
              <div className="h-8 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-paper p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm">暂无匹配的模板，请尝试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-paper hover:shadow-paper-hover transition-all cursor-pointer group border border-transparent hover:border-primary-200"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <CategoryTag category={template.category} size="sm" />
                  <StatusBadge status={template.status} size="sm" />
                </div>

                <h3 className="text-base font-semibold text-neutral-800 mb-4 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[52px]">
                  {template.name}
                </h3>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Hash className="w-3.5 h-3.5 text-neutral-400" />
                    <span>版本号</span>
                    <span className="ml-auto font-medium text-neutral-700">{template.currentVersion}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>更新时间</span>
                    <span className="ml-auto text-neutral-600">{template.updatedAt}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>更新人</span>
                    <span className="ml-auto text-neutral-600">{template.updatedBy}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1 px-5 py-3 border-t border-neutral-100 bg-neutral-50/50 rounded-b-lg">
                {getActionButtons(template.status, template.id)}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-paper px-5 py-3">
          <p className="text-sm text-neutral-500">
            第 <span className="font-medium text-neutral-700">{page}</span> / 共 <span className="font-medium text-neutral-700">{totalPages}</span> 页
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors',
                    page === pageNum
                      ? 'bg-primary-500 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
