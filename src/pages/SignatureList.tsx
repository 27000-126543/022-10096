import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Calendar,
  Store,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  User,
  Clock,
  Tag,
  X,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useDataStore, signatureHasComplaint } from '@/store/dataStore';
import type { SignatureRecord, Project } from '@/data/localMock';

function maskName(name: string): string {
  if (!name || name.length <= 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.slice(0, 4) + '**********' + idCard.slice(-4);
}

export default function SignatureList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const signatures = useDataStore(s => s.signatures);
  const stores = useDataStore(s => s.stores);
  const templates = useDataStore(s => s.templates);
  const projects = useDataStore(s => s.projects) as Project[];

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('all');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [paragraphId, setParagraphId] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [sortField, setSortField] = useState<string>('signedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const tplId = searchParams.get('templateId');
    const paraId = searchParams.get('paragraphId');
    const complaint = searchParams.get('complaint');
    const storeId = searchParams.get('storeId');
    const verId = searchParams.get('versionId');

    if (tplId) setSelectedTemplateId(tplId);
    if (paraId) setParagraphId(paraId);
    if (complaint === '1') setSelectedComplaint('complaint');
    if (complaint === '0') setSelectedComplaint('normal');
    if (storeId) setSelectedStores([storeId]);
    if (verId) setSelectedVersionId(verId);

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();
    if (selectedTemplateId !== 'all') {
      params.set('templateId', selectedTemplateId);
    }
    if (paragraphId) {
      params.set('paragraphId', paragraphId);
    }
    if (selectedVersionId) {
      params.set('versionId', selectedVersionId);
    }
    if (selectedComplaint === 'complaint') {
      params.set('complaint', '1');
    } else if (selectedComplaint === 'normal') {
      params.set('complaint', '0');
    }
    if (selectedStores.length === 1) {
      params.set('storeId', selectedStores[0]);
    }

    const paramStr = params.toString();
    if (paramStr) {
      setSearchParams(params, { replace: false });
    } else {
      setSearchParams({}, { replace: false });
    }
  }, [selectedTemplateId, paragraphId, selectedVersionId, selectedComplaint, selectedStores, isInitialized]);

  const categoryList = useMemo(() => {
    const cats = new Map<string, string>();
    projects.forEach((p) => {
      if (p.level === 1) {
        cats.set(p.categoryId, p.categoryName);
      }
    });
    return Array.from(cats.entries()).map(([id, name]) => ({ id, name }));
  }, [projects]);

  const paragraphName = useMemo(() => {
    if (!paragraphId) return '';
    const sig = signatures.find(s => s.paragraphReadings.some(p => p.paragraphId === paragraphId));
    if (sig) {
      const reading = sig.paragraphReadings.find(p => p.paragraphId === paragraphId);
      return reading?.paragraphTitle || '';
    }
    return '';
  }, [paragraphId, signatures]);

  const versionLabel = useMemo(() => {
    if (!selectedVersionId) return '';
    const tpl = templates.find(t =>
      t.versions.some(v => v.id === selectedVersionId)
    );
    const ver = tpl?.versions.find(v => v.id === selectedVersionId);
    return ver ? `V${ver.version}` : selectedVersionId;
  }, [selectedVersionId, templates]);

  const filteredData = useMemo(() => {
    let result = [...signatures];

    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter((r) => new Date(r.signedAt).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
      result = result.filter((r) => new Date(r.signedAt).getTime() <= end);
    }
    if (selectedStores.length > 0) {
      result = result.filter((r) => selectedStores.includes(r.storeId));
    }
    if (selectedTemplateId !== 'all') {
      result = result.filter((r) => r.templateId === selectedTemplateId);
    }
    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.templateCategory === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'normal') {
        result = result.filter((r) => r.status === 'normal');
      } else if (selectedStatus === 'resign') {
        result = result.filter((r) => r.status === 'resigned');
      }
    }
    if (selectedComplaint !== 'all') {
      if (selectedComplaint === 'complaint') {
        result = result.filter((r) => signatureHasComplaint(r.id));
      } else if (selectedComplaint === 'normal') {
        result = result.filter((r) => !signatureHasComplaint(r.id));
      }
    }
    if (paragraphId) {
      result = result.filter((r) => r.paragraphReadings.some(p => p.paragraphId === paragraphId));
    }
    if (selectedVersionId) {
      result = result.filter((r) => r.templateVersionId === selectedVersionId);
    }
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      result = result.filter(
        (r) =>
          maskName(r.customerName).toLowerCase().includes(search) ||
          maskIdCard(r.customerIdCard).toLowerCase().includes(search) ||
          r.customerName.toLowerCase().includes(search) ||
          r.customerIdCard.toLowerCase().includes(search)
      );
    }

    result.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;
      switch (sortField) {
        case 'signedAt':
          valA = new Date(a.signedAt).getTime();
          valB = new Date(b.signedAt).getTime();
          break;
        case 'totalReadingTime':
          valA = a.totalReadingTime;
          valB = b.totalReadingTime;
          break;
        case 'storeName':
          valA = a.storeName;
          valB = b.storeName;
          break;
        default:
          valA = new Date(a.signedAt).getTime();
          valB = new Date(b.signedAt).getTime();
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return result;
  }, [
    signatures,
    startDate,
    endDate,
    selectedStores,
    selectedTemplateId,
    selectedCategory,
    selectedStatus,
    selectedComplaint,
    paragraphId,
    selectedVersionId,
    searchText,
    sortField,
    sortOrder,
  ]);

  const toggleStore = (storeId: string) => {
    setSelectedStores((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const stats = useMemo(() => {
    const total = filteredData.length;
    const normal = filteredData.filter((r) => r.status === 'normal').length;
    const resigned = filteredData.filter((r) => r.status === 'resigned').length;
    const complaints = filteredData.filter((r) => signatureHasComplaint(r.id)).length;
    const avgTime = total > 0
      ? Math.round(filteredData.reduce((sum, r) => sum + r.totalReadingTime, 0) / total)
      : 0;
    return { total, normal, resigned, complaints, avgTime };
  }, [filteredData]);

  const columns = [
    {
      key: 'index',
      title: '序号',
      width: '60px',
      align: 'center' as const,
      render: (_row: SignatureRecord, index: number) => (
        <span className="text-xs text-neutral-500 font-mono">{index + 1}</span>
      ),
    },
    {
      key: 'customerName',
      title: '顾客姓名',
      width: '100px',
      align: 'center' as const,
      render: (row: SignatureRecord) => (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <User size={10} className="text-white" />
          </div>
          <span className="text-sm text-neutral-800 font-medium">
            {maskName(row.customerName)}
          </span>
        </div>
      ),
    },
    {
      key: 'customerIdCard',
      title: '身份证号',
      width: '170px',
      align: 'center' as const,
      render: (row: SignatureRecord) => (
        <span className="text-xs text-neutral-600 font-mono tracking-wide">
          {maskIdCard(row.customerIdCard)}
        </span>
      ),
    },
    {
      key: 'storeName',
      title: '门店名称',
      width: '170px',
      render: (row: SignatureRecord) => (
        <div className="flex items-center gap-1.5">
          <Store size={13} className="text-primary-500 flex-shrink-0" />
          <span className="text-sm text-neutral-700 truncate">{row.storeName}</span>
        </div>
      ),
    },
    {
      key: 'projectName',
      title: '项目名称',
      width: '140px',
      render: (row: SignatureRecord) => (
        <div className="flex items-center gap-1.5">
          <Tag size={12} className="text-primary-500 flex-shrink-0" />
          <span className="text-sm text-neutral-700">{row.projectName}</span>
        </div>
      ),
    },
    {
      key: 'templateVersion',
      title: '模板版本',
      width: '90px',
      align: 'center' as const,
      render: (row: SignatureRecord) => (
        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-sm">
          v{row.templateVersion}
        </span>
      ),
    },
    {
      key: 'signedAt',
      title: (
        <div
          className="flex items-center justify-center gap-1 cursor-pointer select-none"
          onClick={() => handleSort('signedAt')}
        >
          签署时间
          {sortField === 'signedAt' && (
            sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
          )}
        </div>
      ),
      width: '150px',
      align: 'center' as const,
      render: (row: SignatureRecord) => (
        <div className="text-center">
          <div className="text-xs text-neutral-700 font-medium">
            {new Date(row.signedAt).toLocaleDateString('zh-CN')}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            {new Date(row.signedAt).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'totalReadingTime',
      title: (
        <div
          className="flex items-center justify-center gap-1 cursor-pointer select-none"
          onClick={() => handleSort('totalReadingTime')}
        >
          <Clock size={12} />
          阅读时长
          {sortField === 'totalReadingTime' && (
            sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
          )}
        </div>
      ),
      width: '110px',
      align: 'center' as const,
      render: (row: SignatureRecord) => {
        const seconds = row.totalReadingTime;
        const isLow = seconds < 60;
        return (
          <div className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium',
            isLow
              ? 'bg-danger-50 text-danger-700 border border-danger-200'
              : seconds < 120
              ? 'bg-warning-50 text-warning-700 border border-warning-200'
              : 'bg-success-50 text-success-700 border border-success-200'
          )}>
            {seconds}s
          </div>
        );
      },
    },
    {
      key: 'status',
      title: '签署状态',
      width: '90px',
      align: 'center' as const,
      render: (row: SignatureRecord) => {
        if (row.status === 'normal') {
          return <StatusBadge status="normal" label="正常" />;
        }
        return (
          <span className="inline-flex items-center border rounded-sm px-2 py-0.5 text-[11px] font-medium bg-warning-50 text-warning-700 border-warning-200">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-warning-500" />
            补签
          </span>
        );
      },
    },
    {
      key: 'complaint',
      title: '客诉标记',
      width: '110px',
      align: 'center' as const,
      render: (row: SignatureRecord) => {
        return signatureHasComplaint(row.id) ? (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-medium bg-danger-50 text-danger-700 border border-danger-200">
              <AlertTriangle size={12} />
              涉诉档案
            </span>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-xs text-neutral-300">—</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: '100px',
      align: 'center' as const,
      render: (row: SignatureRecord) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => navigate(`/signatures/${row.id}`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-primary-500 hover:bg-primary-600 rounded-sm transition-colors shadow-sm"
          >
            <Eye size={12} />
            详情
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">签署追踪列表</h1>
        <p className="text-sm text-neutral-500">
          追踪所有顾客知情同意书的签署记录，确保合规性并支持审计追溯
        </p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-5">
        <div className="bg-white border border-neutral-200 rounded-sm p-4 shadow-paper bg-gradient-to-br from-primary-50/30 to-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600">签署总数</span>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <FileText size={14} className="text-primary-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary-700">{stats.total}</div>
          <div className="text-[11px] text-neutral-500 mt-1">当前筛选结果</div>
        </div>
        <div className="bg-white border border-success-200 rounded-sm p-4 shadow-paper bg-gradient-to-br from-success-50/30 to-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600">正常签署</span>
            <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
              <User size={14} className="text-success-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-success-700">{stats.normal}</div>
          <div className="text-[11px] text-success-600 mt-1">
            {stats.total > 0 ? ((stats.normal / stats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className="bg-white border border-warning-200 rounded-sm p-4 shadow-paper bg-gradient-to-br from-warning-50/30 to-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600">补签记录</span>
            <div className="w-8 h-8 rounded-full bg-warning-100 flex items-center justify-center">
              <Clock size={14} className="text-warning-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-warning-700">{stats.resigned}</div>
          <div className="text-[11px] text-warning-600 mt-1">
            {stats.total > 0 ? ((stats.resigned / stats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className="bg-white border border-danger-200 rounded-sm p-4 shadow-paper bg-gradient-to-br from-danger-50/30 to-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600">涉诉记录</span>
            <div className="w-8 h-8 rounded-full bg-danger-100 flex items-center justify-center">
              <AlertTriangle size={14} className="text-danger-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-danger-700">{stats.complaints}</div>
          <div className="text-[11px] text-danger-600 mt-1">
            {stats.total > 0 ? ((stats.complaints / stats.total) * 100).toFixed(1) : 0}% 涉诉率
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-sm p-4 shadow-paper bg-gradient-to-br from-neutral-50/30 to-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600">平均阅读时长</span>
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
              <Clock size={14} className="text-neutral-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-700">
            {stats.avgTime}<span className="text-sm font-normal ml-1">秒</span>
          </div>
          <div className={cn(
            'text-[11px] mt-1',
            stats.avgTime < 60 ? 'text-danger-600' : 'text-neutral-500'
          )}>
            {stats.avgTime < 60 ? '时长偏低，建议关注' : '处于正常范围'}
          </div>
        </div>
      </div>

      {paragraphId && paragraphName && (
        <div className="mb-4 bg-primary-50 border border-primary-200 rounded-sm p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-primary-600" />
            <span className="text-sm text-neutral-700">
              当前筛选：读过「<span className="font-semibold text-primary-700">{paragraphName}</span>」的签署，共 <span className="font-bold text-primary-700">{filteredData.length}</span> 条
            </span>
          </div>
          <button
            onClick={() => setParagraphId('')}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:text-neutral-800 hover:bg-white rounded-sm transition-colors"
          >
            <X size={12} />
            清除筛选
          </button>
        </div>
      )}

      {selectedVersionId && versionLabel && (
        <div className="mb-4 bg-primary-50 border border-primary-200 rounded-sm p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-primary-600" />
            <span className="text-sm text-neutral-700">
              当前筛选：模板版本 <span className="font-semibold text-primary-700">{versionLabel}</span> 的签署，共 <span className="font-bold text-primary-700">{filteredData.length}</span> 条
            </span>
          </div>
          <button
            onClick={() => setSelectedVersionId('')}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:text-neutral-800 hover:bg-white rounded-sm transition-colors"
          >
            <X size={12} />
            清除筛选
          </button>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-sm shadow-paper">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-primary-500" />
                <span className="text-xs font-medium text-neutral-700">签署日期：</span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
              />
              <span className="text-xs text-neutral-400">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
              />

              <div className="w-px h-6 bg-neutral-200 mx-1" />

              <div className="relative">
                <button
                  onClick={() => setShowStoreDropdown(!showStoreDropdown)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-sm transition-colors',
                    selectedStores.length > 0
                      ? 'border-primary-300 bg-primary-50 text-primary-700'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-300'
                  )}
                >
                  <Store size={12} />
                  门店
                  {selectedStores.length > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary-500 text-white">
                      {selectedStores.length}
                    </span>
                  )}
                  <ChevronDown size={12} />
                </button>
                {showStoreDropdown && (
                  <div className="absolute z-20 top-full left-0 mt-1 w-64 bg-white border border-neutral-200 rounded-sm shadow-paper max-h-64 overflow-y-auto">
                    <div className="sticky top-0 px-3 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-neutral-700">选择门店</span>
                      {selectedStores.length > 0 && (
                        <button
                          onClick={() => setSelectedStores([])}
                          className="text-[10px] text-danger-600 hover:underline"
                        >
                          清空
                        </button>
                      )}
                    </div>
                    {stores.filter((s) => s.isActive).map((s) => (
                      <div
                        key={s.id}
                        onClick={() => toggleStore(s.id)}
                        className={cn(
                          'px-3 py-2 cursor-pointer border-b border-neutral-100 last:border-b-0 transition-colors',
                          selectedStores.includes(s.id)
                            ? 'bg-primary-50'
                            : 'hover:bg-neutral-50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'w-3.5 h-3.5 rounded-sm border flex items-center justify-center',
                              selectedStores.includes(s.id)
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-neutral-300'
                            )}
                          >
                            {selectedStores.includes(s.id) && (
                              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                <path
                                  d="M2 5L4 7L8 3"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-xs text-neutral-700">{s.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="px-3 py-1.5 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 bg-white"
              >
                <option value="all">全部模板</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 bg-white"
              >
                <option value="all">全部分类</option>
                {categoryList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 bg-white"
              >
                <option value="all">全部状态</option>
                <option value="normal">正常</option>
                <option value="resign">补签</option>
              </select>

              <select
                value={selectedComplaint}
                onChange={(e) => setSelectedComplaint(e.target.value)}
                className="px-3 py-1.5 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 bg-white"
              >
                <option value="all">涉诉状态</option>
                <option value="complaint">涉诉</option>
                <option value="normal">非涉诉</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-56">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="搜索姓名/身份证..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white bg-primary-500 hover:bg-primary-600 rounded-sm transition-colors shadow-sm"
                >
                  <Download size={12} />
                  导出
                  <ChevronDown size={11} />
                </button>
                {showExportDropdown && (
                  <div className="absolute z-20 top-full right-0 mt-1 w-40 bg-white border border-neutral-200 rounded-sm shadow-paper overflow-hidden">
                    <button className="w-full px-3 py-2.5 flex items-center gap-2 text-xs text-neutral-700 hover:bg-neutral-50 border-b border-neutral-100 transition-colors">
                      <FileSpreadsheet size={13} className="text-success-600" />
                      导出 Excel (.xlsx)
                    </button>
                    <button className="w-full px-3 py-2.5 flex items-center gap-2 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors">
                      <FileText size={13} className="text-primary-600" />
                      导出 CSV (.csv)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-neutral-400" />
            <span className="text-xs text-neutral-600">
              共找到 <span className="font-semibold text-primary-700">{filteredData.length}</span> 条签署记录
            </span>
          </div>
          <div className="text-[11px] text-neutral-500">
            数据来源：/api/signatures
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          rowKey="id"
          pageSize={10}
          stripe
          rowClassName={(row) => signatureHasComplaint((row as SignatureRecord).id) ? 'bg-danger-50/30' : ''}
        />
      </div>
    </div>
  );
}
