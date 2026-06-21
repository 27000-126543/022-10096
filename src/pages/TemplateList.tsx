import { useState, useMemo } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CategoryTag, type CategoryType } from '@/components/ui/CategoryTag';
import { StatusBadge, type StatusType } from '@/components/ui/StatusBadge';
import { useDataStore } from '@/store/dataStore';
import { users, type Template } from '@/data/localMock';

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
  versions: Template['versions'];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function mapStoreStatusToBadge(status: Template['status']): StatusType {
  if (status === 'pending') return 'reviewing';
  return status;
}

function getUserName(userId: string): string {
  const user = users.find((u) => u.id === userId);
  return user?.name || '李法务';
}

export default function TemplateList() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);

  const storeTemplates = useDataStore((s) => s.templates);
  const submitTemplateForReview = useDataStore((s) => s.submitTemplateForReview);

  const filteredTemplates = useMemo(() => {
    let list = [...storeTemplates];

    if (activeCategory !== 'all') {
      list = list.filter((t) => t.category === activeCategory);
    }

    if (activeStatus !== 'all') {
      if (activeStatus === 'reviewing') {
        list = list.filter((t) => t.status === 'pending');
      } else {
        list = list.filter((t) => t.status === activeStatus);
      }
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(kw) || t.id.toLowerCase().includes(kw));
    }

    return list;
  }, [storeTemplates, activeCategory, activeStatus, searchKeyword]);

  const total = filteredTemplates.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedTemplates = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTemplates.slice(start, start + pageSize);
  }, [filteredTemplates, page, pageSize]);

  const displayTemplates: TemplateItem[] = useMemo(() => {
    return pagedTemplates.map((t) => {
      const currentVer = t.versions.find((v) => v.id === t.currentVersionId) || t.versions[t.versions.length - 1];
      return {
        id: t.id,
        name: t.name,
        category: t.category as CategoryType,
        status: mapStoreStatusToBadge(t.status),
        currentVersion: currentVer ? `V${currentVer.version}` : 'V0.0.0',
        updatedAt: formatDate(t.updatedAt),
        updatedBy: getUserName(t.updatedBy),
        tags: t.tags,
        versions: t.versions,
      };
    });
  }, [pagedTemplates]);

  const handleSubmitReview = (template: TemplateItem) => {
    if (template.versions.length === 0) return;
    const lastVersion = template.versions[template.versions.length - 1];
    const result = submitTemplateForReview(template.id, lastVersion.id, 'u001', '李晓明', '提交审核');
    if (result) {
      alert('提交审核成功');
    }
  };

  const handleNavigateEdit = (templateId: string) => {
    navigate(`/templates/${templateId}`);
  };

  const getActionButtons = (template: TemplateItem) => {
    const status = template.status;
    const buttons: JSX.Element[] = [];

    if (['draft', 'rejected'].includes(status)) {
      buttons.push(
        <button
          key="edit"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigateEdit(template.id);
          }}
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
          onClick={(e) => {
            e.stopPropagation();
            handleSubmitReview(template);
          }}
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
          <span>当前显示第 <b className="text-neutral-700">{total === 0 ? 0 : (page - 1) * pageSize + 1}</b> - <b className="text-neutral-700">{Math.min(page * pageSize, total)}</b> 条</span>
        </div>
      </div>

      {displayTemplates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-paper p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm">暂无匹配的模板，请尝试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {displayTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleNavigateEdit(template.id)}
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
                {getActionButtons(template)}
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
