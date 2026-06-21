import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Plus,
  GripVertical,
  Save,
  Send,
  FileText,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import { CategoryTag, type CategoryType } from '@/components/ui/CategoryTag';
import { StatusBadge, type StatusType } from '@/components/ui/StatusBadge';
import { useDataStore } from '@/store/dataStore';
import { users, type Template, type TemplateVersion, type TemplateParagraph } from '@/data/localMock';

const sectionTypes = [
  { key: 'introduction', label: '项目介绍', icon: '📋' },
  { key: 'contraindication', label: '禁忌症', icon: '⛔' },
  { key: 'risk', label: '风险并发症', icon: '⚠️' },
  { key: 'alternative', label: '替代方案', icon: '🔄' },
  { key: 'preoperative', label: '术前注意', icon: '📝' },
  { key: 'postoperative', label: '术后护理', icon: '💊' },
  { key: 'cost', label: '费用说明', icon: '💰' },
  { key: 'dispute', label: '争议处理', icon: '⚖️' },
  { key: 'custom', label: '自定义', icon: '✏️' },
];

const categoryOptions = [
  { value: 'injection', label: '注射类' },
  { value: 'skin', label: '皮肤类' },
  { value: 'plastic', label: '整形类' },
  { value: 'antiaging', label: '抗衰类' },
];

interface TemplateSection {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
  isRiskHighlight: boolean;
}

function mapParagraphToSection(p: TemplateParagraph): TemplateSection {
  let type: string = p.type;
  if (p.type === 'intro') type = 'introduction';
  if (p.type === 'postcare') type = 'postoperative';
  return {
    id: p.id,
    type,
    title: p.title,
    content: p.content,
    order: p.order,
    isRiskHighlight: p.isRiskHighlight,
  };
}

function mapSectionToParagraph(s: TemplateSection): TemplateParagraph {
  let type: TemplateParagraph['type'] = 'custom';
  if (s.type === 'introduction') type = 'intro';
  else if (s.type === 'postoperative') type = 'postcare';
  else if (s.type === 'contraindication') type = 'contraindication';
  else if (s.type === 'alternative') type = 'alternative';
  else if (s.type === 'dispute') type = 'dispute';
  else type = 'custom';
  return {
    id: s.id,
    title: s.title,
    order: s.order,
    type,
    content: s.content,
    isRiskHighlight: s.isRiskHighlight,
  };
}

function mapStoreStatusToBadge(status: Template['status']): StatusType {
  if (status === 'pending') return 'reviewing';
  return status;
}

const dotColorMap: Record<string, string> = {
  draft_saved: 'bg-neutral-400',
  submitted: 'bg-primary-500',
  approved: 'bg-success-500',
  rejected: 'bg-danger-500',
  deployed: 'bg-purple-500',
  replaced: 'bg-orange-500',
  withdrawn: 'bg-neutral-500',
};

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const templates = useDataStore((s) => s.templates);
  const saveTemplateDraft = useDataStore((s) => s.saveTemplateDraft);
  const submitTemplateForReview = useDataStore((s) => s.submitTemplateForReview);
  const getTemplateActivityLogs = useDataStore((s) => s.getTemplateActivityLogs);

  const template = useMemo(() => {
    if (id && id !== 'new') {
      const found = templates.find((t) => t.id === id);
      if (found) return found;
    }
    return templates[0];
  }, [templates, id]);

  const currentVersion: TemplateVersion | undefined = useMemo(() => {
    if (!template) return undefined;
    const draftVersion = template.versions.find((v) => !v.isPublished);
    if (draftVersion) return draftVersion;
    return template.versions[template.versions.length - 1];
  }, [template]);

  const [templateName, setTemplateName] = useState(template?.name || '');
  const [category, setCategory] = useState<CategoryType>((template?.category as CategoryType) || 'injection');
  const [sections, setSections] = useState<TemplateSection[]>(
    currentVersion?.paragraphs.map(mapParagraphToSection) || []
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    currentVersion?.paragraphs[0]?.id || ''
  );
  const [version, setVersion] = useState(currentVersion ? `V${currentVersion.version}` : 'V1.0.0');
  const [changeNote, setChangeNote] = useState(currentVersion?.changeLog || '');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const templateId = template?.id || '';
  const historyLogs = useMemo(() => {
    if (!templateId) return [];
    return getTemplateActivityLogs(templateId);
  }, [templateId, getTemplateActivityLogs]);

  const versionGroupedLogs = useMemo(() => {
    const groups: { version: string; logs: typeof historyLogs; isCurrent: boolean }[] = [];
    const versionMap = new Map<string, typeof historyLogs>();
    historyLogs.forEach(log => {
      const ver = log.version || '未知版本';
      if (!versionMap.has(ver)) {
        versionMap.set(ver, []);
      }
      versionMap.get(ver)!.push(log);
    });
    versionMap.forEach((logs, ver) => {
      const isCurrent = currentVersion ? ver === currentVersion.version : false;
      groups.push({ version: ver, logs, isCurrent });
    });
    groups.sort((a, b) => {
      if (a.isCurrent) return -1;
      if (b.isCurrent) return 1;
      const aTime = a.logs[0]?.timestamp || '';
      const bTime = b.logs[0]?.timestamp || '';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
    return groups;
  }, [historyLogs, currentVersion]);

  const handleLogClick = (log: any) => {
    if (log.reviewId) {
      navigate(`/reviews/${log.reviewId}`);
    } else if (log.deployId) {
      navigate('/deploy');
    } else if (log.detailUrl) {
      navigate(log.detailUrl);
    }
  };

  const handleAddSection = (type: string) => {
    const typeConfig = sectionTypes.find((t) => t.key === type);
    const newSection: TemplateSection = {
      id: `s${Date.now()}`,
      type,
      title: `${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][sections.length] || ''}、${typeConfig?.label || '新段落'}`,
      content: '请在此输入段落内容...',
      order: sections.length + 1,
      isRiskHighlight: type === 'risk',
    };
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    const newSections = sections
      .filter((s) => s.id !== sectionId)
      .map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(newSections);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(newSections[0].id);
    }
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sections.length - 1) return;

    const newSections = [...sections];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];
    newSections.forEach((s, i) => (s.order = i + 1));
    setSections(newSections);
  };

  const handleToggleRiskHighlight = (sectionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, isRiskHighlight: !s.isRiskHighlight } : s
      )
    );
  };

  const handleUpdateSection = (sectionId: string, field: 'title' | 'content', value: string) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    if (!template || !currentVersion) return;
    setSaving(true);
    try {
      const paragraphs = sections.map(mapSectionToParagraph);
      saveTemplateDraft(template.id, currentVersion.id, {
        name: templateName,
        paragraphs,
        changeLog: changeNote,
      });
    } finally {
      setTimeout(() => setSaving(false), 800);
    }
  };

  const handleSubmit = async () => {
    if (!template || !currentVersion) return;
    setSubmitting(true);
    try {
      const paragraphs = sections.map(mapSectionToParagraph);
      saveTemplateDraft(template.id, currentVersion.id, {
        name: templateName,
        paragraphs,
        changeLog: changeNote,
      });
      submitTemplateForReview(
        template.id,
        currentVersion.id,
        'u001',
        '李晓明',
        changeNote || '提交审核'
      );
      alert('提交成功');
      navigate('/reviews');
    } finally {
      setTimeout(() => setSubmitting(false), 800);
    }
  };

  const getTypeConfig = (type: string) => sectionTypes.find((t) => t.key === type);

  if (!template || !currentVersion) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-neutral-100">
        <p className="text-neutral-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-neutral-100 animate-fade-in">
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-lg font-semibold text-neutral-800 bg-transparent border-none outline-none focus:bg-neutral-50 rounded px-2 py-1 -mx-2 min-w-[320px]"
              placeholder="请输入模板名称"
            />
          </div>
          <CategoryTag category={category} size="md" />
          <StatusBadge status={mapStoreStatusToBadge(template.status)} size="md" />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-500">模板分类：</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="px-3 py-1.5 text-sm border border-neutral-200 rounded-md bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 h-6 text-sm text-neutral-400">
            <span className="px-2">|</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors disabled:opacity-60"
          >
            <Save className={cn('w-4 h-4', saving && 'animate-spin')} />
            {saving ? '保存中...' : '保存草稿'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors shadow-sm disabled:opacity-60"
          >
            <Send className={cn('w-4 h-4', submitting && 'animate-spin')} />
            {submitting ? '提交中...' : '提交审核'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[30%] min-w-[280px] max-w-[380px] bg-white border-r border-neutral-200 flex flex-col">
          <div className="px-4 py-3 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-500" />
              段落列表
            </h3>
            <p className="text-xs text-neutral-400 mt-1">共 {sections.length} 个段落 · 可拖拽排序</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sections.map((section, idx) => {
              const typeConfig = getTypeConfig(section.type);
              const isSelected = selectedSectionId === section.id;
              return (
                <div
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={cn(
                    'group relative px-3 py-3 mx-2 my-1 rounded-md cursor-pointer transition-all border',
                    isSelected
                      ? 'bg-primary-50 border-primary-200'
                      : 'bg-white border-transparent hover:bg-neutral-50 hover:border-neutral-200'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="mt-0.5 cursor-grab text-neutral-300 group-hover:text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="拖拽排序"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">{typeConfig?.icon}</span>
                        <span className="text-xs text-neutral-400">{typeConfig?.label}</span>
                        {section.isRiskHighlight && (
                          <AlertTriangle className="w-3 h-3 text-danger-500 ml-auto" />
                        )}
                      </div>
                      <p className={cn(
                        'text-sm font-medium truncate',
                        isSelected ? 'text-primary-700' : 'text-neutral-700'
                      )}>
                        {section.title}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {section.content.substring(0, 50)}...
                      </p>
                    </div>
                  </div>

                  <div className={cn(
                    'flex items-center gap-0.5 mt-2 pt-2 border-t border-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity',
                    isSelected && 'opacity-100'
                  )}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRiskHighlight(section.id);
                      }}
                      title={section.isRiskHighlight ? '取消风险高亮' : '设置风险高亮'}
                      className={cn(
                        'w-7 h-7 flex items-center justify-center rounded transition-colors',
                        section.isRiskHighlight
                          ? 'bg-danger-50 text-danger-600'
                          : 'hover:bg-neutral-100 text-neutral-500'
                      )}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(section.id, 'up');
                      }}
                      disabled={idx === 0}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="上移"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(section.id, 'down');
                      }}
                      disabled={idx === sections.length - 1}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="下移"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      disabled={sections.length <= 1}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-danger-50 text-neutral-500 hover:text-danger-600 disabled:opacity-30 disabled:cursor-not-allowed ml-auto"
                      title="删除段落"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
            <div className="grid grid-cols-3 gap-1.5">
              {sectionTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => handleAddSection(type.key)}
                  className="flex flex-col items-center gap-1 px-2 py-2 rounded-md border border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50 transition-colors group"
                >
                  <span className="text-base">{type.icon}</span>
                  <span className="text-[10px] text-neutral-500 group-hover:text-primary-600">
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
            <button className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-md transition-colors">
              <Plus className="w-3.5 h-3.5" />
              添加自定义段落
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-neutral-100 p-6 flex justify-center">
          <div className="w-full max-w-[800px]">
            <div className="bg-white shadow-paper rounded-sm min-h-[1000px] relative">
              {sections.map((section) => {
                const isActive = selectedSectionId === section.id;
                return (
                  <div
                    key={section.id}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={cn(
                      'relative px-16 py-8 cursor-text transition-all',
                      section.isRiskHighlight && 'bg-risk-light/40',
                      isActive && 'ring-1 ring-primary-200'
                    )}
                    style={{
                      borderLeft: isActive
                        ? '3px solid #1E3A5F'
                        : section.isRiskHighlight
                        ? '3px solid #FF8A65'
                        : '3px solid transparent',
                    }}
                  >
                    {section.isRiskHighlight && (
                      <div className="absolute top-6 right-6 flex items-center gap-1 px-2 py-1 bg-danger-500 text-white text-[10px] font-medium rounded">
                        <AlertTriangle className="w-3 h-3" />
                        风险提示
                      </div>
                    )}
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-lg font-bold text-neutral-800 mb-4 bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-primary-400 outline-none pb-1 -mb-3 transition-colors"
                    />
                    <textarea
                      value={section.content}
                      onChange={(e) => handleUpdateSection(section.id, 'content', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-[15px] text-neutral-700 leading-8 bg-transparent border-none outline-none resize-none font-sans"
                      style={{ minHeight: '120px' }}
                      rows={Math.max(6, section.content.split('\n').length + 2)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-4 text-xs text-neutral-400">
              A4纸预览 · 点击任意区域进行编辑
            </div>
          </div>
        </div>

        <div className="w-[10%] min-w-[200px] max-w-[260px] bg-white border-l border-neutral-200 flex flex-col">
          <div className="p-4 border-b border-neutral-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-semibold text-neutral-700">版本信息</span>
            </div>
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg p-4 text-white">
              <p className="text-xs opacity-70 mb-1">当前版本号</p>
              <p className="text-2xl font-bold tracking-wide">{version}</p>
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-1.5 text-xs opacity-80">
                <Clock className="w-3 h-3" />
                上次保存：{formatDate(template.updatedAt)}
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-neutral-100 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-semibold text-neutral-700">变更说明</span>
            </div>
            <textarea
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="请填写本次修改的变更说明，提交审核时必填..."
              className="w-full h-40 text-xs text-neutral-700 border border-neutral-200 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 placeholder:text-neutral-400 leading-relaxed"
            />
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>段落数量</span>
                <span className="font-medium text-neutral-700">{sections.length}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>风险高亮</span>
                <span className="font-medium text-danger-600">
                  {sections.filter((s) => s.isRiskHighlight).length} 处
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>总字符数</span>
                <span className="font-medium text-neutral-700">
                  {sections.reduce((acc, s) => acc + s.title.length + s.content.length, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-semibold text-neutral-700">版本历史</span>
                <span className="text-[10px] text-neutral-400">({versionGroupedLogs.length} 个版本)</span>
              </div>
              {showHistory ? (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              )}
            </button>
            {showHistory && (
              <div className="px-4 pb-4 max-h-[400px] overflow-y-auto">
                {versionGroupedLogs.length === 0 ? (
                  <div className="text-[11px] text-neutral-400 py-2 text-center">
                    暂无历史记录
                  </div>
                ) : (
                  versionGroupedLogs.map((group) => (
                    <div key={group.version} className="mb-3 last:mb-0">
                      <div
                        className={cn(
                          'flex items-center gap-2 mb-2 px-2 py-1.5 rounded-sm text-xs font-semibold',
                          group.isCurrent
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'bg-neutral-50 text-neutral-600 border border-neutral-200'
                        )}
                      >
                        <span className="font-mono">V{group.version}</span>
                        {group.isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary-100 text-primary-600 rounded-sm">
                            当前编辑
                          </span>
                        )}
                        {group.logs.some(l => l.reviewId) && (
                          <button
                            onClick={() => {
                              const logWithReview = group.logs.find(l => l.reviewId);
                              if (logWithReview?.reviewId) {
                                navigate(`/reviews/${logWithReview.reviewId}`);
                              }
                            }}
                            className="ml-auto text-[10px] text-primary-500 hover:text-primary-700 hover:underline"
                          >
                            查看审核详情
                          </button>
                        )}
                      </div>
                      <div className="relative pl-3">
                        <div className="absolute left-[5px] top-1 bottom-1 w-px bg-neutral-200" />
                        {group.logs.map((log) => {
                          const isClickable = log.reviewId || log.deployId || log.detailUrl;
                          return (
                            <div
                              key={log.id}
                              onClick={() => isClickable && handleLogClick(log)}
                              className={cn(
                                'relative pb-3 last:pb-0 transition-colors rounded-r-sm',
                                isClickable && 'cursor-pointer hover:bg-neutral-50 -ml-3 pl-3 mr-1'
                              )}
                              title={formatDateTime(log.timestamp)}
                            >
                              <div className={cn(
                                'absolute -left-[7px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-white z-10',
                                dotColorMap[log.type] || 'bg-neutral-400'
                              )} />
                              <div className="pl-2">
                                <div className="text-[11px] font-medium text-neutral-700 flex items-center justify-between">
                                  <span className="truncate">{log.typeLabel}</span>
                                  <span className="text-[10px] text-neutral-400 flex-shrink-0 ml-2">
                                    {formatDate(log.timestamp)}
                                  </span>
                                </div>
                                <div className="text-[10px] text-neutral-400 mt-0.5 truncate">
                                  {log.operatorName}
                                </div>
                                {log.description && (
                                  <div className="text-[10px] text-neutral-500 mt-0.5 line-clamp-2">
                                    {log.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="p-4 space-y-2 border-t border-neutral-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-md transition-colors disabled:opacity-60"
            >
              <Save className={cn('w-4 h-4', saving && 'animate-spin')} />
              {saving ? '保存中...' : '保存草稿'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors shadow-sm disabled:opacity-60"
            >
              <Send className={cn('w-4 h-4', submitting && 'animate-spin')} />
              {submitting ? '提交中...' : '提交审核'}
            </button>
            <p className="text-[10px] text-neutral-400 text-center pt-2 leading-relaxed">
              提交后将进入法务审核流程<br />
              审核通过后即可发布使用
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
