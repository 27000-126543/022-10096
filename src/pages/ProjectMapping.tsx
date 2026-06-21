import { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Syringe,
  Sparkles,
  Scissors,
  Clock,
  Plus,
  Save,
  Trash2,
  Users,
  FileText,
  Tag,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDataStore, type ProjectMappingConfig } from '@/store/dataStore';
import type { Project } from '@/data/localMock';

type PopulationType = 'adult' | 'minor' | 'retreatment' | 'custom';

const populationOptions: { value: PopulationType; label: string }[] = [
  { value: 'adult', label: '成人' },
  { value: 'minor', label: '未成年人' },
  { value: 'retreatment', label: '二次治疗' },
  { value: 'custom', label: '其他' },
];

const categoryIcons: Record<string, typeof Syringe> = {
  injection: Syringe,
  skin: Sparkles,
  plastic: Scissors,
  antiaging: Clock,
};

const categoryColors: Record<string, string> = {
  injection: 'text-[#7B4B94]',
  skin: 'text-[#2D7DD2]',
  plastic: 'text-[#2E7D5B]',
  antiaging: 'text-[#B8860B]',
};

interface TreeNode {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  parentId: string | null;
  level: number;
  sort: number;
  mappedTemplateVersions: {
    type: string;
    templateId: string;
    versionId: string;
    version: string;
  }[];
  children: TreeNode[];
}

function buildTree(items: Project[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  items.forEach((item) => {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.sort - b.sort);
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);

  return roots;
}

function countMappings(node: TreeNode): number {
  let count = node.mappedTemplateVersions.length;
  node.children.forEach((c) => (count += countMappings(c)));
  return count;
}

export default function ProjectMapping() {
  const projects = useDataStore(s => s.projects);
  const templates = useDataStore(s => s.templates);
  const projectMappings = useDataStore(s => s.projectMappings);
  const saveProjectMappings = useDataStore(s => s.saveProjectMappings);

  const tree = useMemo(() => buildTree(projects), [projects]);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(tree.map((r) => r.id))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mappingRows, setMappingRows] = useState<ProjectMappingConfig[]>([]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedId) || null,
    [selectedId, projects]
  );

  useEffect(() => {
    if (selectedProject) {
      const storedMappings = projectMappings[selectedProject.id] || [];
      if (storedMappings.length > 0) {
        setMappingRows(storedMappings);
      } else if (selectedProject.level === 3 && selectedProject.mappedTemplateVersions.length > 0) {
        const rows: ProjectMappingConfig[] = selectedProject.mappedTemplateVersions.map(
          (m, idx) => ({
            id: `${selectedProject.id}_m_${idx}`,
            populationType: m.type as PopulationType,
            populationLabel:
              populationOptions.find((o) => o.value === (m.type as PopulationType))
                ?.label || m.type,
            templateId: m.templateId,
            versionId: m.versionId,
            version: m.version,
            isDefault: idx === 0,
          })
        );
        setMappingRows(rows);
      } else {
        setMappingRows([]);
      }
    } else {
      setMappingRows([]);
    }
  }, [selectedProject, projectMappings]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const matchSearch = (node: TreeNode): boolean => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (node.name.toLowerCase().includes(q)) return true;
    return node.children.some(matchSearch);
  };

  const renderTreeNode = (node: TreeNode, level: number): React.ReactNode => {
    if (!matchSearch(node)) return null;
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedId === node.id;
    const Icon = categoryIcons[node.categoryId] || Syringe;
    const mapCount = node.level === 3 ? countMappings(node) : 0;
    const storedCount = projectMappings[node.id]?.length || 0;
    const displayCount = Math.max(mapCount, storedCount);

    return (
      <div key={node.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-2 pr-3 cursor-pointer transition-all group',
            'border-l-3',
            isSelected
              ? 'bg-primary-50 border-primary-500 text-primary-700'
              : 'border-transparent hover:bg-neutral-50 text-neutral-700',
            level === 1 && 'px-3 font-semibold',
            level === 2 && 'pl-6 pr-3 text-sm',
            level === 3 && 'pl-10 pr-3 text-sm'
          )}
          onClick={() => {
            setSelectedId(node.id);
            if (hasChildren) toggleExpand(node.id);
          }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-neutral-400 hover:text-primary-500"
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          ) : (
            <span className="w-4 h-4 flex-shrink-0" />
          )}

          {level === 1 && (
            <Icon size={16} className={cn(categoryColors[node.categoryId])} />
          )}

          <span className="flex-1 truncate">{node.name}</span>

          {level === 3 && displayCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-primary-100 text-primary-600 flex-shrink-0">
              {displayCount}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="animate-fade-in">
            {node.children.map((c) => renderTreeNode(c, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const addMappingRow = () => {
    const newRow: ProjectMappingConfig = {
      id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      populationType: 'adult',
      populationLabel: '成人',
      templateId: templates[0]?.id || '',
      versionId: templates[0]?.versions[0]?.id || '',
      version: templates[0]?.versions[0]?.version || '',
      isDefault: mappingRows.length === 0,
    };
    setMappingRows([...mappingRows, newRow]);
  };

  const updateRow = (id: string, updates: Partial<ProjectMappingConfig>) => {
    setMappingRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        if (updates.populationType) {
          updated.populationLabel =
            populationOptions.find((o) => o.value === updates.populationType)
              ?.label || updates.populationType;
        }
        if (updates.templateId) {
          const t = templates.find(x => x.id === updates.templateId);
          const v = t?.versions[0];
          if (v) {
            updated.versionId = v.id;
            updated.version = v.version;
          }
        }
        return updated;
      })
    );
  };

  const deleteRow = (id: string) => {
    setMappingRows((prev) => {
      const remaining = prev.filter((r) => r.id !== id);
      if (remaining.length > 0 && !remaining.some(r => r.isDefault)) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
  };

  const setDefaultRow = (id: string) => {
    setMappingRows((prev) =>
      prev.map((r) => ({ ...r, isDefault: r.id === id }))
    );
  };

  const handleSave = () => {
    if (!selectedProject || mappingRows.length === 0) return;
    saveProjectMappings(selectedProject.id, mappingRows);
    alert('配置已保存');
  };

  const getTemplateVersions = (templateId: string) => {
    const t = templates.find((x) => x.id === templateId);
    return t?.versions || [];
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50">
      <div className="px-6 py-4 bg-white border-b border-neutral-200">
        <h1 className="text-lg font-semibold text-primary-800">项目模板映射配置</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          管理医美项目与知情同意书模板版本的关联关系
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tree */}
        <div
          className="bg-white border-r border-neutral-200 flex flex-col"
          style={{ width: '35%' }}
        >
          <div className="p-4 border-b border-neutral-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索项目名称..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {tree.map((node) => renderTreeNode(node, 1))}
          </div>
        </div>

        {/* Right Panel - Config */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedProject ? (
            <div className="flex-1 flex items-center justify-center text-neutral-400">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">请从左侧选择具体项目进行配置</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 py-4 bg-white border-b border-neutral-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-semibold text-neutral-800">
                        {selectedProject.name}
                      </h2>
                      <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-sm bg-neutral-100 text-neutral-600 border border-neutral-200">
                        <Tag size={10} className="mr-1" />
                        {(() => {
                          const parent2 = projects.find(
                            (p) => p.id === selectedProject.parentId
                          );
                          const parent1 = projects.find(
                            (p) => p.id === parent2?.parentId
                          );
                          return (
                            parent1?.categoryName || selectedProject.categoryName
                          );
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-500">
                      <Tag size={12} />
                      <span>项目编码：PRJ{selectedProject.id.replace('prj', '')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto p-6">
                <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-paper">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-primary-500 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-[13px] whitespace-nowrap">
                            适用人群
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-[13px] whitespace-nowrap">
                            关联模板
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-[13px] whitespace-nowrap">
                            版本号
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-[13px] whitespace-nowrap">
                            启用条件
                          </th>
                          <th className="px-4 py-3 text-center font-medium text-[13px] whitespace-nowrap">
                            设为默认
                          </th>
                          <th className="px-4 py-3 text-center font-medium text-[13px] whitespace-nowrap w-20">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappingRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-16 text-center text-neutral-400 text-sm"
                            >
                              暂无配置，点击下方「添加版本配置」开始
                            </td>
                          </tr>
                        ) : (
                          mappingRows.map((row, idx) => (
                            <tr
                              key={row.id}
                              className={cn(
                                'border-b border-neutral-100',
                                idx % 2 === 1 && 'bg-neutral-50/70'
                              )}
                            >
                              <td className="px-4 py-3">
                                <select
                                  value={row.populationType}
                                  onChange={(e) =>
                                    updateRow(row.id, {
                                      populationType: e.target
                                        .value as PopulationType,
                                    })
                                  }
                                  className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 bg-white"
                                >
                                  {populationOptions.map((o) => (
                                    <option key={o.value} value={o.value}>
                                      {o.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={row.templateId}
                                  onChange={(e) => {
                                    updateRow(row.id, {
                                      templateId: e.target.value,
                                    });
                                  }}
                                  className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 bg-white"
                                >
                                  <option value="">请选择模板</option>
                                  {templates.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={row.versionId}
                                  onChange={(e) => {
                                    const t = templates.find(x => x.id === row.templateId);
                                    const v = t?.versions.find(v => v.id === e.target.value);
                                    updateRow(row.id, {
                                      versionId: e.target.value,
                                      version: v?.version || '',
                                    });
                                  }}
                                  className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 bg-white"
                                >
                                  <option value="">选择版本</option>
                                  {getTemplateVersions(row.templateId).map(
                                    (v) => (
                                      <option key={v.id} value={v.id}>
                                        v{v.version}
                                        {v.isPublished ? ' (已发布)' : ''}
                                      </option>
                                    )
                                  )}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                                    <Users size={12} />
                                    <span>年龄</span>
                                  </div>
                                  <input
                                    type="number"
                                    value={row.minAge ?? ''}
                                    onChange={(e) =>
                                      updateRow(row.id, {
                                        minAge: e.target.value
                                          ? Number(e.target.value)
                                          : undefined,
                                      })
                                    }
                                    placeholder="最小"
                                    className="w-14 px-1.5 py-1 text-xs border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400"
                                  />
                                  <span className="text-neutral-400">-</span>
                                  <input
                                    type="number"
                                    value={row.maxAge ?? ''}
                                    onChange={(e) =>
                                      updateRow(row.id, {
                                        maxAge: e.target.value
                                          ? Number(e.target.value)
                                          : undefined,
                                      })
                                    }
                                    placeholder="最大"
                                    className="w-14 px-1.5 py-1 text-xs border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400"
                                  />
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-xs text-neutral-500 w-16">
                                    治疗次数
                                  </span>
                                  <input
                                    type="number"
                                    value={row.priorTreatmentCount ?? ''}
                                    onChange={(e) =>
                                      updateRow(row.id, {
                                        priorTreatmentCount: e.target
                                          .value
                                          ? Number(e.target.value)
                                          : undefined,
                                      })
                                    }
                                    placeholder="≥次数"
                                    className="w-20 px-1.5 py-1 text-xs border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => setDefaultRow(row.id)}
                                  className="inline-flex items-center justify-center"
                                >
                                  {row.isDefault ? (
                                    <ToggleRight
                                      size={22}
                                      className="text-primary-500"
                                    />
                                  ) : (
                                    <ToggleLeft
                                      size={22}
                                      className="text-neutral-300 hover:text-neutral-400 transition-colors"
                                    />
                                  )}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => deleteRow(row.id)}
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-sm text-neutral-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={addMappingRow}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-sm hover:bg-primary-100 hover:border-primary-300 transition-colors"
                  >
                    <Plus size={15} />
                    添加版本配置
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={mappingRows.length === 0}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-sm transition-colors',
                      mappingRows.length === 0
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    )}
                  >
                    <Save size={15} />
                    保存配置
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
