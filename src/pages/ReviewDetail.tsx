import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  GripVertical,
  Clock,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  reviewRecords,
  templates,
  type ReviewRecord,
  type TemplateParagraph,
} from '@/data/localMock';
import StatusBadge from '@/components/ui/StatusBadge';
import CategoryTag from '@/components/ui/CategoryTag';

type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

interface LineDiff {
  text: string;
  type: DiffType;
}

interface ParagraphDiff {
  paragraphId: string;
  title: string;
  order: number;
  isRiskHighlight: boolean;
  oldLines: LineDiff[];
  newLines: LineDiff[];
  hasChanges: boolean;
}

function htmlToLines(html: string): string[] {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = temp.textContent || temp.innerText || '';
  return text.split(/\n/).filter((l) => l.trim().length > 0);
}

function computeLineDiff(oldText: string[], newText: string[]): LineDiff[] {
  const result: LineDiff[] = [];
  const maxLen = Math.max(oldText.length, newText.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldText[i] || '';
    const newLine = newText[i] || '';

    if (!oldLine && newLine) {
      result.push({ text: newLine, type: 'added' });
    } else if (oldLine && !newLine) {
      result.push({ text: oldLine, type: 'removed' });
    } else if (oldLine !== newLine) {
      result.push({ text: `${oldLine}  →  ${newLine}`, type: 'modified' });
    } else {
      result.push({ text: oldLine, type: 'unchanged' });
    }
  }

  return result;
}

function computeParagraphDiffs(
  oldParagraphs: TemplateParagraph[],
  newParagraphs: TemplateParagraph[]
): ParagraphDiff[] {
  const allIds = new Set<string>();
  oldParagraphs.forEach((p) => allIds.add(p.id));
  newParagraphs.forEach((p) => allIds.add(p.id));

  const result: ParagraphDiff[] = [];

  allIds.forEach((id) => {
    const oldP = oldParagraphs.find((p) => p.id === id);
    const newP = newParagraphs.find((p) => p.id === id);

    const title = newP?.title || oldP?.title || '';
    const order = newP?.order ?? oldP?.order ?? 999;
    const isRisk = newP?.isRiskHighlight ?? oldP?.isRiskHighlight ?? false;

    const oldLines = oldP ? htmlToLines(oldP.content) : [];
    const newLines = newP ? htmlToLines(newP.content) : [];

    const diffs = computeLineDiff(oldLines, newLines);
    const hasChanges = diffs.some(
      (d) => d.type === 'added' || d.type === 'removed' || d.type === 'modified'
    );

    result.push({
      paragraphId: id,
      title,
      order,
      isRiskHighlight: isRisk,
      oldLines: oldLines.map((t) => {
        const diff = diffs.find(
          (d) => d.text.includes(t) || t.includes(d.text.split('  →  ')[0])
        );
        return { text: t, type: diff?.type === 'modified' ? 'removed' : diff?.type || 'unchanged' };
      }),
      newLines: newLines.map((t) => {
        const diff = diffs.find(
          (d) => d.text.includes(t) || t.includes(d.text.split('  →  ')[1] || t)
        );
        return { text: t, type: diff?.type === 'modified' ? 'added' : diff?.type || 'unchanged' };
      }),
      hasChanges,
    });
  });

  return result.sort((a, b) => a.order - b.order);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}

const lineClass: Record<DiffType, string> = {
  added: 'bg-success-50 border-l-2 border-success-400 pl-2',
  removed:
    'bg-danger-50 border-l-2 border-danger-400 pl-2 line-through text-danger-700',
  modified: 'bg-warning-50 border-l-2 border-warning-400 pl-2',
  unchanged: '',
};

export default function ReviewDetail() {
  const record: ReviewRecord = reviewRecords[0];
  const template = templates.find((t) => t.id === record.templateId)!;
  const newVersion = template.versions.find((v) => v.id === record.versionId);
  const oldVersion =
    template.versions.filter((v) => v.isPublished)[0] ||
    template.versions[template.versions.length - 2] ||
    template.versions[0];

  const paragraphDiffs = useMemo(
    () => computeParagraphDiffs(oldVersion?.paragraphs || [], newVersion?.paragraphs || []),
    [oldVersion, newVersion]
  );

  const riskParagraphs = paragraphDiffs.filter((p) => p.isRiskHighlight);

  const [activeTab, setActiveTab] = useState<string>(
    paragraphDiffs.find((p) => p.hasChanges)?.paragraphId || paragraphDiffs[0]?.paragraphId || ''
  );

  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedRisks, setSelectedRisks] = useState<Set<string>>(new Set());

  const activeParagraph = paragraphDiffs.find((p) => p.paragraphId === activeTab);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      if (newWidth >= 20 && newWidth <= 80) {
        setLeftWidth(newWidth);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const toggleRisk = (id: string) => {
    setSelectedRisks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApprove = () => {
    console.log('Approve:', record.id, reviewComment, selectedRisks);
    alert('已通过审核');
  };

  const handleReject = () => {
    console.log('Reject:', record.id, reviewComment);
    alert('已驳回');
  };

  const renderLines = (lines: LineDiff[], isOld: boolean) => (
    <div className="space-y-1.5 text-sm text-neutral-700 leading-relaxed">
      {lines.length === 0 ? (
        <div className="text-neutral-400 italic py-4 text-center text-xs">
          {isOld ? '此段落为新增内容，旧版本不存在' : '此段落已删除，新版本不存在'}
        </div>
      ) : (
        lines.map((line, idx) => (
          <div
            key={idx}
            className={cn('py-1 px-1 rounded-sm text-[13px]', lineClass[line.type])}
          >
            {line.type === 'added' && (
              <span className="inline-block w-4 text-success-600 font-bold text-xs mr-1">
                +
              </span>
            )}
            {line.type === 'removed' && (
              <span className="inline-block w-4 text-danger-600 font-bold text-xs mr-1">
                -
              </span>
            )}
            {line.type === 'modified' && (
              <span className="inline-block w-4 text-warning-600 font-bold text-xs mr-1">
                ~
              </span>
            )}
            {line.text}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-neutral-50">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-neutral-200">
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
          <button className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700">
            <ChevronLeft size={14} />
            返回审核列表
          </button>
          <span>/</span>
          <span>版本审核</span>
          <span>/</span>
          <span className="text-neutral-700">{template.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-semibold text-primary-800">
                {template.name}
              </h1>
              <CategoryTag
                category={
                  (template.category === 'antiaging'
                    ? 'antiaging'
                    : template.category) as Parameters<typeof CategoryTag>[0]['category']
                }
                size="md"
              />
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-mono font-medium rounded-sm bg-primary-50 text-primary-600 border border-primary-100">
                版本 v{record.version}
              </span>
              <StatusBadge
                status={
                  record.status === 'pending'
                    ? 'reviewing'
                    : (record.status as Parameters<typeof StatusBadge>[0]['status'])
                }
                size="md"
              />
            </div>

            <div className="flex items-center gap-6 mt-3 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <FileText size={12} />
                <span>变更说明：{record.changeSummary}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[11px] font-medium">
              {record.submitterName.slice(0, 1)}
            </div>
            <div>
              <div className="text-neutral-700 font-medium">
                提交人：{record.submitterName}
              </div>
              <div className="flex items-center gap-1 text-neutral-400 mt-0.5">
                <Calendar size={10} />
                {formatDate(record.submitTime)}
              </div>
            </div>
          </div>

          {record.reviewerName && (
            <>
              <div className="w-px h-8 bg-neutral-200" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-success-100 flex items-center justify-center text-success-600 text-[11px] font-medium">
                  {record.reviewerName.slice(0, 1)}
                </div>
                <div>
                  <div className="text-neutral-700 font-medium">
                    审核人：{record.reviewerName}
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400 mt-0.5">
                    <Clock size={10} />
                    {record.reviewTime ? formatDate(record.reviewTime) : '-'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Paragraph Tabs */}
      <div className="px-6 py-3 bg-white border-b border-neutral-200 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {paragraphDiffs.map((p) => (
            <button
              key={p.paragraphId}
              onClick={() => setActiveTab(p.paragraphId)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm border transition-all',
                activeTab === p.paragraphId
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-600'
              )}
            >
              {p.isRiskHighlight && (
                <AlertTriangle
                  size={11}
                  className={activeTab === p.paragraphId ? 'text-warning-200' : 'text-warning-500'}
                />
              )}
              <span className="max-w-[140px] truncate">{p.title}</span>
              {p.hasChanges && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px]',
                    activeTab === p.paragraphId
                      ? 'bg-white/20 text-white'
                      : 'bg-warning-100 text-warning-700'
                  )}
                >
                  变更
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Diff Viewer */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* Left - Old Version */}
        <div
          className="bg-white overflow-y-auto flex flex-col"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="sticky top-0 z-10 px-4 py-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neutral-400" />
              <span className="text-xs font-semibold text-neutral-600">
                旧版本
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                v{oldVersion?.version || '-'}
              </span>
            </div>
            {activeParagraph && (
              <div className="flex items-center gap-1">
                {activeParagraph.isRiskHighlight && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-sm bg-risk-light text-risk-dark border border-risk-border">
                    <AlertTriangle size={9} />
                    风险条款
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 p-5 opacity-70">
            {activeParagraph && renderLines(activeParagraph.oldLines, true)}
          </div>
        </div>

        {/* Draggable Divider */}
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            'w-1.5 bg-neutral-200 cursor-col-resize flex items-center justify-center transition-colors flex-shrink-0',
            isDragging ? 'bg-primary-400' : 'hover:bg-primary-300'
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center w-5 h-10 rounded-sm transition-colors',
              isDragging ? 'bg-primary-500 text-white' : 'bg-neutral-300 text-neutral-500'
            )}
          >
            <GripVertical size={14} />
          </div>
        </div>

        {/* Right - New Version */}
        <div
          className="bg-white overflow-y-auto flex flex-col"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div className="sticky top-0 z-10 px-4 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500" />
              <span className="text-xs font-semibold text-primary-700">
                新版本
              </span>
              <span className="text-xs text-primary-500 font-mono">
                v{newVersion?.version || record.version}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-success-100 border-l-2 border-success-400" />
                新增
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-danger-100 border-l-2 border-danger-400" />
                删除
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-warning-100 border-l-2 border-warning-400" />
                修改
              </span>
            </div>
          </div>

          <div className="flex-1 p-5">
            {activeParagraph && renderLines(activeParagraph.newLines, false)}
          </div>
        </div>
      </div>

      {/* Review Action Panel */}
      <div className="bg-white border-t border-neutral-200 px-6 py-5">
        <div className="flex items-start gap-6">
          {/* Comment */}
          <div className="flex-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 mb-2">
              <Info size={12} className="text-neutral-400" />
              审核意见
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              placeholder="请输入审核意见，驳回时需说明修改原因..."
              className="w-full px-4 py-3 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 resize-none"
            />
          </div>

          {/* Risk Recheck */}
          {riskParagraphs.length > 0 && (
            <div className="w-72">
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 mb-2">
                <AlertTriangle size={12} className="text-warning-500" />
                需法务重新确认的风险条款
              </label>
              <div className="p-3 bg-warning-50 border border-warning-100 rounded-sm space-y-2 max-h-[120px] overflow-y-auto">
                {riskParagraphs.map((p) => (
                  <label
                    key={p.paragraphId}
                    className="flex items-start gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRisks.has(p.paragraphId)}
                      onChange={() => toggleRisk(p.paragraphId)}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs text-neutral-600 leading-snug group-hover:text-neutral-800">
                      {p.title}
                      {p.hasChanges && (
                        <span className="ml-1 text-warning-600 font-medium">
                          (已变更)
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
              {selectedRisks.size > 0 && (
                <p className="text-[10px] text-warning-600 mt-1.5">
                  已勾选 {selectedRisks.size} 项需重点关注
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-neutral-100">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-sm hover:bg-neutral-100 transition-colors">
            <User size={14} />
            转办审核
          </button>
          <button
            onClick={handleReject}
            className="inline-flex items-center gap-1.5 px-6 py-2 text-sm font-medium text-white bg-danger-500 rounded-sm hover:bg-danger-600 transition-colors shadow-sm"
          >
            <XCircle size={15} />
            驳回
          </button>
          <button
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 px-6 py-2 text-sm font-medium text-white bg-success-500 rounded-sm hover:bg-success-600 transition-colors shadow-sm"
          >
            <CheckCircle2 size={15} />
            通过
          </button>
        </div>
      </div>
    </div>
  );
}
