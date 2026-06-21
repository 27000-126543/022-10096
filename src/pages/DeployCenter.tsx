import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ChevronRight,
  Check,
  X,
  Calendar,
  Clock,
  FileText,
  Store as StoreIcon,
  MapPin,
  Building2,
  AlertCircle,
  Eye,
  Download,
  Undo2,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useDataStore } from '@/store/dataStore';
import type { Template, Region, DeployRecord } from '@/data/localMock';

type TabType = 'new' | 'records';

interface RegionData {
  key: Region;
  name: string;
}

const regions: RegionData[] = [
  { key: 'north', name: '华北区' },
  { key: 'east', name: '华东区' },
  { key: 'south', name: '华南区' },
  { key: 'west', name: '西南区' },
  { key: 'central', name: '华中区' },
];

const categoryColorMap: Record<string, string> = {
  injection: 'text-[#7B4B94] bg-[#7B4B94]/10 border-[#7B4B94]/30',
  skin: 'text-[#2D7DD2] bg-[#2D7DD2]/10 border-[#2D7DD2]/30',
  plastic: 'text-[#2E7D5B] bg-[#2E7D5B]/10 border-[#2E7D5B]/30',
  antiaging: 'text-[#B8860B] bg-[#B8860B]/10 border-[#B8860B]/30',
};

export default function DeployCenter() {
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const deploys = useDataStore(s => s.deploys);

  const activeCount = deploys.filter((d) => d.status === 'active').length;

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">门店发布中心</h1>
        <p className="text-sm text-neutral-500">管理合规模板的门店发布与追踪，确保所有门店使用最新版本的知情同意书</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm shadow-paper">
        <div className="flex items-center border-b border-neutral-200 px-4">
          <button
            onClick={() => setActiveTab('new')}
            className={cn(
              'px-6 py-4 text-sm font-medium relative transition-colors',
              activeTab === 'new'
                ? 'text-primary-600'
                : 'text-neutral-600 hover:text-neutral-800'
            )}
          >
            <span className="flex items-center gap-2">
              <Plus size={16} />
              新建发布
            </span>
            {activeTab === 'new' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={cn(
              'px-6 py-4 text-sm font-medium relative transition-colors',
              activeTab === 'records'
                ? 'text-primary-600'
                : 'text-neutral-600 hover:text-neutral-800'
            )}
          >
            <span className="flex items-center gap-2">
              <FileText size={16} />
              已发布记录
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 border border-primary-200">
                {activeCount}
              </span>
            </span>
            {activeTab === 'records' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
        </div>

        {activeTab === 'new' ? <NewDeployTab onSuccess={() => setActiveTab('records')} /> : <DeployRecordsTab />}
      </div>
    </div>
  );
}

function NewDeployTab({ onSuccess }: { onSuccess: () => void }) {
  const templates = useDataStore(s => s.templates);
  const stores = useDataStore(s => s.stores);
  const createDeployRecord = useDataStore(s => s.createDeployRecord);

  const publishedTemplates = templates.filter((t) => t.status === 'approved');

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(publishedTemplates[0] || null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  const [selectedRegions, setSelectedRegions] = useState<Set<Region>>(new Set());
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());

  const [isImmediate, setIsImmediate] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [forceReadingMinutes, setForceReadingMinutes] = useState<number>(5);
  const [versionNote, setVersionNote] = useState('');

  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return publishedTemplates;
    const search = templateSearch.toLowerCase();
    return publishedTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.categoryName.toLowerCase().includes(search) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  }, [templateSearch, publishedTemplates]);

  const regionStoreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    regions.forEach((r) => {
      counts[r.key] = stores.filter((s) => s.region === r.key && s.isActive).length;
    });
    return counts;
  }, [stores]);

  const citiesInSelectedRegions = useMemo(() => {
    const cities = new Set<string>();
    stores
      .filter((s) => selectedRegions.has(s.region) && s.isActive)
      .forEach((s) => cities.add(s.city));
    return Array.from(cities);
  }, [selectedRegions, stores]);

  const storesInSelectedCities = useMemo(() => {
    return stores.filter(
      (s) =>
        (selectedCities.has(s.city) ||
          (selectedRegions.has(s.region) && selectedCities.size === 0)) &&
        s.isActive
    );
  }, [selectedCities, selectedRegions, stores]);

  const previewStats = useMemo(() => {
    const effectiveStores = selectedStores.size > 0 ? selectedStores : new Set(storesInSelectedCities.map((s) => s.id));
    const citiesCount = new Set(
      stores.filter((s) => effectiveStores.has(s.id)).map((s) => s.city)
    ).size;
    return {
      stores: effectiveStores.size,
      cities: citiesCount,
      effectiveStoreIds: Array.from(effectiveStores),
    };
  }, [selectedStores, storesInSelectedCities, stores]);

  const toggleRegion = (region: Region) => {
    const newRegions = new Set(selectedRegions);
    if (newRegions.has(region)) {
      newRegions.delete(region);
      setSelectedRegions(newRegions);
      const citiesToRemove = new Set(
        stores.filter((s) => s.region === region).map((s) => s.city)
      );
      const newCities = new Set(selectedCities);
      Array.from(citiesToRemove).forEach((c) => newCities.delete(c));
      setSelectedCities(newCities);
    } else {
      newRegions.add(region);
      setSelectedRegions(newRegions);
    }
  };

  const toggleCity = (city: string) => {
    const newCities = new Set(selectedCities);
    if (newCities.has(city)) {
      newCities.delete(city);
    } else {
      newCities.add(city);
    }
    setSelectedCities(newCities);
  };

  const selectAllCities = () => {
    setSelectedCities(new Set(citiesInSelectedRegions));
  };

  const clearAllCities = () => {
    setSelectedCities(new Set());
  };

  const toggleStore = (storeId: string) => {
    const newStores = new Set(selectedStores);
    if (newStores.has(storeId)) {
      newStores.delete(storeId);
    } else {
      newStores.add(storeId);
    }
    setSelectedStores(newStores);
  };

  const selectAllStores = () => {
    setSelectedStores(new Set(storesInSelectedCities.map((s) => s.id)));
  };

  const clearAllStores = () => {
    setSelectedStores(new Set());
  };

  const handleConfirmDeploy = () => {
    if (!selectedTemplate || previewStats.stores === 0) return;

    const version = selectedTemplate.versions.find(v => v.id === selectedTemplate.currentVersionId) || selectedTemplate.versions[0];
    if (!version) return;

    const effectiveStoreIds = previewStats.effectiveStoreIds;
    const deployStores = stores.filter(s => effectiveStoreIds.includes(s.id));
    const deployRegions = Array.from(selectedRegions);

    const scheduledAt = !isImmediate && scheduledDate && scheduledTime
      ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      : null;

    createDeployRecord({
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      versionId: version.id,
      version: version.version,
      region: deployRegions,
      storeIds: effectiveStoreIds,
      storeNames: deployStores.map(s => s.name),
      status: isImmediate ? 'active' : 'scheduled',
      deployType: isImmediate ? 'immediate' : 'scheduled',
      scheduledAt,
      withdrawnAt: null,
      deployedBy: 'u002',
      deployNote: versionNote,
    });

    alert('发布成功！');
    onSuccess();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center mb-3">
          <FileText size={18} className="text-primary-600 mr-2" />
          <h3 className="text-sm font-semibold text-neutral-800">选择模板</h3>
          <span className="ml-2 text-xs text-danger-500">*</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="relative">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="搜索模板名称、分类、标签..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                onFocus={() => setShowTemplateDropdown(true)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
              />
            </div>
            {showTemplateDropdown && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-sm shadow-paper max-h-64 overflow-y-auto">
                {filteredTemplates.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-neutral-400">
                    未找到匹配的模板
                  </div>
                ) : (
                  filteredTemplates.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTemplate(t);
                        setShowTemplateDropdown(false);
                        setTemplateSearch('');
                      }}
                      className={cn(
                        'px-4 py-3 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0',
                        selectedTemplate?.id === t.id
                          ? 'bg-primary-50 border-l-2 border-l-primary-500'
                          : 'hover:bg-neutral-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-800">{t.name}</span>
                        <span
                          className={cn(
                            'text-[11px] px-2 py-0.5 rounded-sm border',
                            categoryColorMap[t.category]
                          )}
                        >
                          {t.categoryName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-neutral-500">
                          版本: v{t.versions.find((v) => v.id === t.currentVersionId)?.version || '1.0.0'}
                        </span>
                        <div className="flex gap-1">
                          {t.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedTemplate && (
            <div className="col-span-2 bg-gradient-to-r from-primary-50 to-primary-50/50 border border-primary-100 rounded-sm p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-primary-800">
                      {selectedTemplate.name}
                    </h4>
                    <span
                      className={cn(
                        'text-[11px] px-2 py-0.5 rounded-sm border',
                        categoryColorMap[selectedTemplate.category]
                      )}
                    >
                      {selectedTemplate.categoryName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-600">
                    <span className="flex items-center gap-1">
                      <FileText size={12} className="text-primary-500" />
                      当前版本: v{selectedTemplate.versions.find((v) => v.id === selectedTemplate.currentVersionId)?.version}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-primary-500" />
                      共 {selectedTemplate.versions.filter((v) => v.isPublished).length} 个历史版本
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 size={12} className="text-primary-500" />
                      {selectedTemplate.versions.find((v) => v.id === selectedTemplate.currentVersionId)?.paragraphs.length} 个条款段落
                    </span>
                  </div>
                </div>
                <StatusBadge status="approved" label="已审核" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center mb-3">
          <MapPin size={18} className="text-primary-600 mr-2" />
          <h3 className="text-sm font-semibold text-neutral-800">选择发布范围</h3>
          <span className="ml-2 text-xs text-danger-500">*</span>
          <span className="ml-2 text-xs text-neutral-500">
            按区域 → 城市 → 门店逐级筛选，可多选
          </span>
        </div>
        <div className="grid grid-cols-3 gap-0 border border-neutral-200 rounded-sm overflow-hidden h-[360px]">
          <div className="border-r border-neutral-200 bg-white">
            <div className="px-3 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700">区域</span>
              <span className="text-[11px] text-neutral-500">{stores.filter(s => s.isActive).length} 家门店</span>
            </div>
            <div className="overflow-y-auto h-[300px]">
              {regions.map((region) => {
                const isSelected = selectedRegions.has(region.key);
                return (
                  <div
                    key={region.key}
                    onClick={() => toggleRegion(region.key)}
                    className={cn(
                      'px-3 py-3 cursor-pointer transition-all border-b border-neutral-100 flex items-center justify-between group',
                      isSelected
                        ? 'bg-primary-50 border-l-4 border-l-primary-500'
                        : 'hover:bg-neutral-50 border-l-4 border-l-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors',
                          isSelected
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-neutral-300 group-hover:border-primary-400'
                        )}
                      >
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-primary-700' : 'text-neutral-700'
                        )}
                      >
                        {region.name}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-sm',
                        isSelected
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-neutral-100 text-neutral-600'
                      )}
                    >
                      {regionStoreCounts[region.key]} 家
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-r border-neutral-200 bg-white">
            <div className="px-3 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700">城市</span>
              <div className="flex items-center gap-2">
                {selectedRegions.size > 0 && (
                  <>
                    <button
                      onClick={selectAllCities}
                      className="text-[11px] text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      全选
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                      onClick={clearAllCities}
                      className="text-[11px] text-neutral-500 hover:text-neutral-700 hover:underline"
                    >
                      清空
                    </button>
                  </>
                )}
                <span className="text-[11px] text-neutral-500 ml-1">
                  {selectedCities.size}/{citiesInSelectedRegions.length}
                </span>
              </div>
            </div>
            <div className="overflow-y-auto h-[300px]">
              {selectedRegions.size === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                  <ChevronRight size={20} className="mb-2 opacity-50" />
                  <p className="text-xs">请先选择区域</p>
                </div>
              ) : citiesInSelectedRegions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                  <AlertCircle size={20} className="mb-2 opacity-50" />
                  <p className="text-xs">暂无可用城市</p>
                </div>
              ) : (
                citiesInSelectedRegions.map((city) => {
                  const isSelected = selectedCities.has(city);
                  const cityStoreCount = stores.filter(
                    (s) => s.city === city && s.isActive
                  ).length;
                  return (
                    <div
                      key={city}
                      onClick={() => toggleCity(city)}
                      className={cn(
                        'px-3 py-2.5 cursor-pointer transition-all border-b border-neutral-100 flex items-center justify-between group',
                        isSelected
                          ? 'bg-primary-50/70'
                          : 'hover:bg-neutral-50'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-neutral-300 group-hover:border-primary-400'
                          )}
                        >
                          {isSelected && <Check size={10} className="text-white" />}
                        </div>
                        <span
                          className={cn(
                            'text-sm',
                            isSelected ? 'text-primary-700 font-medium' : 'text-neutral-700'
                          )}
                        >
                          {city}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500">{cityStoreCount} 家</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white">
            <div className="px-3 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700">门店</span>
              <div className="flex items-center gap-2">
                {storesInSelectedCities.length > 0 && (
                  <>
                    <button
                      onClick={selectAllStores}
                      className="text-[11px] text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      全选
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                      onClick={clearAllStores}
                      className="text-[11px] text-neutral-500 hover:text-neutral-700 hover:underline"
                    >
                      清空
                    </button>
                  </>
                )}
                <span className="text-[11px] text-neutral-500 ml-1">
                  {selectedStores.size}/{storesInSelectedCities.length}
                </span>
              </div>
            </div>
            <div className="overflow-y-auto h-[300px]">
              {storesInSelectedCities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                  <StoreIcon size={20} className="mb-2 opacity-50" />
                  <p className="text-xs">请先选择城市</p>
                </div>
              ) : (
                storesInSelectedCities.map((store) => {
                  const isSelected = selectedStores.has(store.id);
                  return (
                    <div
                      key={store.id}
                      onClick={() => toggleStore(store.id)}
                      className={cn(
                        'px-3 py-2.5 cursor-pointer transition-all border-b border-neutral-100 group',
                        isSelected
                          ? 'bg-primary-50/70'
                          : 'hover:bg-neutral-50'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors flex-shrink-0',
                            isSelected
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-neutral-300 group-hover:border-primary-400'
                          )}
                        >
                          {isSelected && <Check size={10} className="text-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-neutral-400 font-mono">
                              {store.id.toUpperCase()}
                            </span>
                            <ChevronRight size={10} className="text-neutral-300" />
                            <span
                              className={cn(
                                'text-sm truncate',
                                isSelected ? 'text-primary-700 font-medium' : 'text-neutral-700'
                              )}
                            >
                              {store.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {store.city} · {store.manager}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-5">
          <div className="flex items-center mb-4">
            <Clock size={18} className="text-primary-600 mr-2" />
            <h3 className="text-sm font-semibold text-neutral-800">发布配置</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-sm">
              <div>
                <div className="text-sm font-medium text-neutral-800">立即发布</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  确认后立即在所有选中门店生效
                </div>
              </div>
              <button
                onClick={() => setIsImmediate(true)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  isImmediate ? 'bg-primary-500' : 'bg-neutral-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-sm shadow transition-all',
                    isImmediate ? 'left-6' : 'left-0.5'
                  )}
                />
              </button>
            </div>

            {!isImmediate && (
              <div className="p-3 bg-white border border-warning-200 rounded-sm bg-warning-50/30">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} className="text-warning-600" />
                  <span className="text-sm font-medium text-warning-800">定时发布</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-600 mb-1 block">发布日期</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600 mb-1 block">发布时间</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-white border border-neutral-200 rounded-sm">
              <label className="text-xs text-neutral-600 mb-2 block flex items-center gap-1.5">
                <AlertCircle size={12} className="text-warning-500" />
                强制阅读时长 (分钟)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={forceReadingMinutes}
                  onChange={(e) => setForceReadingMinutes(Number(e.target.value))}
                  className="w-24 px-3 py-2 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 text-center"
                />
                <span className="text-xs text-neutral-500">
                  顾客必须在此时间内完整阅读后方可签署
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-5">
          <div className="flex items-center mb-4">
            <FileText size={18} className="text-primary-600 mr-2" />
            <h3 className="text-sm font-semibold text-neutral-800">版本说明</h3>
            <span className="ml-2 text-xs text-neutral-500">(选填)</span>
          </div>
          <textarea
            value={versionNote}
            onChange={(e) => setVersionNote(e.target.value)}
            placeholder="请输入本次发布的版本变更说明，如：优化禁忌症条款、新增血管栓塞风险提示等..."
            rows={9}
            className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 resize-none"
          />
          <div className="flex justify-end mt-2">
            <span className="text-[11px] text-neutral-400">
              {versionNote.length} / 500 字
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-sm text-white">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <StoreIcon size={18} />
            <div>
              <div className="text-xs text-primary-100">覆盖门店</div>
              <div className="text-xl font-bold">{previewStats.stores}</div>
            </div>
          </div>
          <div className="w-px h-10 bg-primary-400/50" />
          <div className="flex items-center gap-2">
            <Building2 size={18} />
            <div>
              <div className="text-xs text-primary-100">覆盖城市</div>
              <div className="text-xl font-bold">{previewStats.cities}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2 text-sm bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-sm transition-colors">
            <span className="flex items-center gap-1.5">
              <X size={14} />
              取消
            </span>
          </button>
          <button
            onClick={handleConfirmDeploy}
            disabled={!selectedTemplate || previewStats.stores === 0 || (!isImmediate && (!scheduledDate || !scheduledTime))}
            className={cn(
              'px-6 py-2.5 text-sm font-medium rounded-sm transition-all shadow-md',
              (!selectedTemplate || previewStats.stores === 0 || (!isImmediate && (!scheduledDate || !scheduledTime)))
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'bg-white text-primary-700 hover:bg-primary-50'
            )}
          >
            <span className="flex items-center gap-1.5">
              <Download size={14} />
              确认发布
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DeployRecordsTab() {
  const deploys = useDataStore(s => s.deploys);
  const stores = useDataStore(s => s.stores);
  const withdrawDeploy = useDataStore(s => s.withdrawDeploy);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  const filteredRecords = useMemo(() => {
    return deploys.filter((record) => {
      if (statusFilter !== 'all' && record.status !== statusFilter) return false;
      if (storeFilter !== 'all' && !record.storeIds.includes(storeFilter)) return false;
      return true;
    });
  }, [statusFilter, storeFilter, deploys]);

  const handleWithdraw = (deployId: string) => {
    if (confirm('确定要撤下此发布吗？')) {
      withdrawDeploy(deployId);
    }
  };

  const columns = [
    {
      key: 'templateName',
      title: '模板名称',
      width: '240px',
      render: (row: DeployRecord) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-neutral-800 truncate">{row.templateName}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">{row.deployNote || '无备注'}</div>
        </div>
      ),
    },
    {
      key: 'version',
      title: '版本号',
      width: '90px',
      align: 'center' as const,
      render: (row: DeployRecord) => (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200 rounded-sm font-mono">
          v{row.version}
        </span>
      ),
    },
    {
      key: 'scope',
      title: '发布范围',
      width: '150px',
      align: 'center' as const,
      render: (row: DeployRecord) => (
        <div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 text-neutral-700">
              <Building2 size={12} className="text-primary-500" />
              {row.region.length || new Set(stores.filter((s) => row.storeIds.includes(s.id)).map((s) => s.city)).size} 城
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-0.5 text-xs text-neutral-500">
            <StoreIcon size={10} className="text-neutral-400" />
            {row.storeIds.length} 店
          </div>
        </div>
      ),
    },
    {
      key: 'deployedAt',
      title: '发布时间',
      width: '150px',
      align: 'center' as const,
      render: (row: DeployRecord) => (
        <div className="text-center">
          <div className="text-xs text-neutral-700">
            {new Date(row.deployedAt).toLocaleDateString('zh-CN')}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            {new Date(row.deployedAt).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'effectiveAt',
      title: '启用时间',
      width: '150px',
      align: 'center' as const,
      render: (row: DeployRecord) => {
        const effectiveDate = row.deployType === 'scheduled' && row.scheduledAt ? row.scheduledAt : row.deployedAt;
        return (
          <div className="text-center">
            <div
              className={cn(
                'text-xs font-medium',
                row.deployType === 'scheduled' && !row.scheduledAt ? 'text-warning-600' : 'text-neutral-700'
              )}
            >
              {new Date(effectiveDate).toLocaleDateString('zh-CN')}
            </div>
            {row.deployType === 'scheduled' && (
              <div className="text-[10px] mt-0.5 text-warning-600">定时发布</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'deployedBy',
      title: '发布人',
      width: '100px',
      align: 'center' as const,
      render: () => (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-medium text-primary-700">
            医务
          </div>
          <span className="text-xs text-neutral-700">王建国</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: '90px',
      align: 'center' as const,
      render: (row: DeployRecord) => {
        if (row.status === 'active') {
          return <StatusBadge status="active" label="生效中" />;
        }
        if (row.status === 'scheduled') {
          return (
            <span className="inline-flex items-center border rounded-sm px-2 py-0.5 text-[11px] font-medium bg-warning-50 text-warning-700 border-warning-200">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-warning-500 animate-pulse-soft" />
              待生效
            </span>
          );
        }
        return <StatusBadge status="revoked" label="已撤下" />;
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: '160px',
      align: 'center' as const,
      render: (row: DeployRecord) => (
        <div className="flex items-center justify-center gap-2">
          <button className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200 rounded-sm transition-colors">
            <Eye size={12} />
            详情
          </button>
          {(row.status === 'active' || row.status === 'scheduled') && (
            <button
              onClick={() => handleWithdraw(row.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-danger-600 hover:text-danger-700 hover:bg-danger-50 border border-danger-200 rounded-sm transition-colors"
            >
              <Undo2 size={12} />
              撤下
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-neutral-500" />
            <span className="text-xs text-neutral-600 font-medium">筛选：</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 bg-white"
          >
            <option value="all">全部状态</option>
            <option value="active">生效中</option>
            <option value="scheduled">待生效</option>
            <option value="withdrawn">已撤下</option>
          </select>

          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 bg-white"
          >
            <option value="all">全部门店</option>
            {stores.filter((s) => s.isActive).slice(0, 10).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 bg-white"
          >
            <option value="all">全部时间</option>
            <option value="7">近7天</option>
            <option value="30">近30天</option>
            <option value="90">近90天</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-800 border border-neutral-300 rounded-sm transition-colors">
            <ArrowUpDown size={12} />
            排序
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-primary-600 hover:text-primary-700 border border-primary-300 rounded-sm transition-colors bg-primary-50">
            <Download size={12} />
            导出记录
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-success-200 rounded-sm bg-gradient-to-br from-success-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600">生效中发布</span>
            <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
              <Check size={16} className="text-success-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-success-700 mt-2">
            {deploys.filter((d) => d.status === 'active').length}
          </div>
        </div>
        <div className="p-4 bg-white border border-warning-200 rounded-sm bg-gradient-to-br from-warning-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600">待生效</span>
            <div className="w-8 h-8 rounded-full bg-warning-100 flex items-center justify-center">
              <Clock size={16} className="text-warning-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-warning-700 mt-2">
            {deploys.filter((d) => d.status === 'scheduled').length}
          </div>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-sm bg-gradient-to-br from-neutral-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600">已撤下</span>
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
              <X size={16} className="text-neutral-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-700 mt-2">
            {deploys.filter((d) => d.status === 'withdrawn').length}
          </div>
        </div>
        <div className="p-4 bg-white border border-primary-200 rounded-sm bg-gradient-to-br from-primary-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600">覆盖门店总数</span>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <StoreIcon size={16} className="text-primary-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary-700 mt-2">{stores.filter((s) => s.isActive).length}</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredRecords}
        rowKey="id"
        pageSize={8}
        stripe
      />
    </div>
  );
}
