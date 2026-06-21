import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Store,
  UserCheck,
  FileText,
  Download,
  Printer,
  Eye,
  AlertTriangle,
  BookOpen,
  Mic,
  ShieldCheck,
  PenLine,
  Activity,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  ScrollText,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useDataStore, signatureHasComplaint, getComplaintDetail } from '@/store/dataStore';
import type { TemplateParagraph } from '@/data/localMock';

type ActionType = 'read' | 'explain' | 'confirm' | 'sign' | 'complaint';

interface TimelineAction {
  id: string;
  type: ActionType;
  paragraphId?: string;
  label: string;
  description: string;
  timestamp: string;
  operator: string;
}

function maskName(name: string): string {
  if (!name || name.length <= 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.slice(0, 4) + '**********' + idCard.slice(-4);
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function SignatureDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const getSignatureById = useDataStore(s => s.getSignatureById);
  const signatures = useDataStore(s => s.signatures);
  const templates = useDataStore(s => s.templates);

  const signature = useMemo(() => {
    return getSignatureById(id!) || signatures[0];
  }, [id, getSignatureById, signatures]);

  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const template = templates.find((t) => t.id === signature.templateId);
  const version = template?.versions.find((v) => v.id === signature.templateVersionId);
  const paragraphs = version?.paragraphs || [];

  const hasComplaint = signatureHasComplaint(signature.id);

  const complaintDetail = useMemo(() => {
    return getComplaintDetail(signature.id, signature.signedAt, signature.paragraphReadings);
  }, [signature]);

  const timelineActions: TimelineAction[] = useMemo(() => {
    const actions: TimelineAction[] = [];
    const baseTime = new Date(signature.signedAt);

    actions.push({
      id: 'action_start',
      type: 'read',
      label: '进入阅读',
      description: '顾客进入知情同意书阅读页面',
      timestamp: new Date(baseTime.getTime() - signature.totalReadingTime * 1000 - 30000).toISOString(),
      operator: maskName(signature.customerName),
    });

    signature.paragraphReadings.forEach((reading, idx) => {
      const paraTime = new Date(baseTime.getTime() - signature.totalReadingTime * 1000 + (idx * 60000));
      const paragraph = paragraphs.find((p) => p.id === reading.paragraphId);

      if (paragraph) {
        actions.push({
          id: `explain_${reading.paragraphId}`,
          type: 'explain',
          paragraphId: reading.paragraphId,
          label: `讲解「${paragraph.title}」`,
          description: `咨询师对条款内容进行专业讲解说明`,
          timestamp: new Date(paraTime.getTime() + 5000).toISOString(),
          operator: signature.consultantName,
        });

        if (reading.confirmAction) {
          actions.push({
            id: `confirm_${reading.paragraphId}`,
            type: 'confirm',
            paragraphId: reading.paragraphId,
            label: `确认「${paragraph.title}」`,
            description: paragraph.isRiskHighlight
              ? '顾客确认理解风险条款内容并点击确认按钮'
              : '顾客已阅读并确认本条款内容',
            timestamp: reading.confirmAt || paraTime.toISOString(),
            operator: maskName(signature.customerName),
          });
        }
      }
    });

    actions.push({
      id: 'action_sign',
      type: 'sign',
      label: '手写签字确认',
      description: '顾客完成所有条款阅读后，进行电子手写签名',
      timestamp: signature.signedAt,
      operator: maskName(signature.customerName),
    });

    if (hasComplaint && complaintDetail) {
      actions.push({
        id: 'action_complaint',
        type: 'complaint',
        label: '客诉发起',
        description: `顾客发起客诉，原因：${complaintDetail.complaintType}`,
        timestamp: complaintDetail.complaintTime,
        operator: maskName(signature.customerName),
      });
    }

    return actions;
  }, [signature, paragraphs, hasComplaint, complaintDetail]);

  const actionIcon = (type: ActionType) => {
    switch (type) {
      case 'read':
        return <BookOpen size={14} />;
      case 'explain':
        return <Mic size={14} />;
      case 'confirm':
        return <ShieldCheck size={14} />;
      case 'sign':
        return <PenLine size={14} />;
      case 'complaint':
        return <AlertTriangle size={14} />;
    }
  };

  const actionColor = (type: ActionType) => {
    switch (type) {
      case 'read':
        return 'bg-primary-500 border-primary-500';
      case 'explain':
        return 'bg-warning-500 border-warning-500';
      case 'confirm':
        return 'bg-success-500 border-success-500';
      case 'sign':
        return 'bg-danger-500 border-danger-500';
      case 'complaint':
        return 'bg-red-600 border-red-600';
    }
  };

  const totalReadingSeconds = signature.totalReadingTime;

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-sm border border-neutral-300 bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft size={16} className="text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">签署详情</h1>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
              <span>签署编号：</span>
              <span className="font-mono text-neutral-700">{signature.id.toUpperCase()}</span>
              <span className="mx-1">·</span>
              <span>数据来源：/api/signatures/{signature.id}</span>
              {hasComplaint && (
                <>
                  <span className="mx-1">·</span>
                  <span className="inline-flex items-center text-danger-600">
                    <AlertTriangle size={12} className="mr-1" />
                    涉诉标记
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-neutral-700 bg-white border border-neutral-300 rounded-sm hover:bg-neutral-50 transition-colors">
            <Printer size={15} />
            打印档案
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-primary-500 hover:bg-primary-600 rounded-sm transition-colors shadow-sm">
            <Download size={15} />
            导出完整PDF
          </button>
        </div>
      </div>

      {hasComplaint && complaintDetail && (
        <div className="mb-5 p-3 rounded-sm bg-danger-50 border border-danger-200 text-danger-700 flex items-center gap-2">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">涉诉档案</span>
            <span className="ml-2 text-sm">该签署记录已关联客诉事件</span>
          </div>
          <div className="text-xs font-mono bg-white/60 px-2 py-1 rounded-sm border border-danger-200">
            {complaintDetail.complaintId}
          </div>
        </div>
      )}

      <div className="grid grid-cols-6 gap-4 mb-5">
        <div className="col-span-2 bg-white border border-neutral-200 rounded-sm shadow-paper p-4 bg-gradient-to-br from-primary-50/50 to-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-neutral-500">顾客信息</div>
              <div className="text-sm font-semibold text-neutral-800">
                {maskName(signature.customerName)}
              </div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">身份证号</span>
              <span className="font-mono text-neutral-700">{maskIdCard(signature.customerIdCard)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">年龄</span>
              <span className="text-neutral-700">{signature.age} 岁</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-neutral-500">手机号</span>
              <span className="text-neutral-700">{signature.customerPhone}</span>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-white border border-neutral-200 rounded-sm shadow-paper p-4 bg-gradient-to-br from-warning-50/50 to-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center">
              <ScrollText size={16} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-neutral-500">项目与模板</div>
              <div className="text-sm font-semibold text-neutral-800 truncate">
                {signature.projectName}
              </div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">模板名称</span>
              <span className="text-neutral-700 truncate ml-2 max-w-[150px]" title={signature.templateName}>
                {signature.templateName}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">模板版本</span>
              <span className="font-mono text-primary-700 font-medium">v{signature.templateVersion}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-neutral-500">阅读总时长</span>
              <span className="font-semibold text-success-700">{totalReadingSeconds} 秒</span>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-white border border-neutral-200 rounded-sm shadow-paper p-4 bg-gradient-to-br from-success-50/50 to-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-neutral-500">签署信息</div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-neutral-800 truncate">
                  {signature.storeName}
                </div>
                {signature.status === 'normal' ? (
                  <StatusBadge status="normal" label="正常" />
                ) : (
                  <span className="inline-flex items-center border rounded-sm px-1.5 py-0.5 text-[10px] font-medium bg-warning-50 text-warning-700 border-warning-200">
                    <span className="w-1.5 h-1.5 rounded-full mr-1 bg-warning-500" />
                    补签
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">咨询师</span>
              <span className="text-neutral-700">{signature.consultantName}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
              <span className="text-neutral-500 flex items-center gap-1">
                <Calendar size={10} />
                签署日期
              </span>
              <span className="text-neutral-700">
                {new Date(signature.signedAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-neutral-500 flex items-center gap-1">
                <Clock size={10} />
                签署时间
              </span>
              <span className="text-neutral-700">
                {new Date(signature.signedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {hasComplaint && complaintDetail && (
        <div className="mb-5 bg-white border border-danger-200 rounded-sm shadow-paper overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-danger-50/50 to-white border-b border-danger-200 flex items-center gap-2">
            <AlertTriangle size={16} className="text-danger-600" />
            <span className="text-sm font-semibold text-neutral-800">涉诉信息</span>
            <span className={cn(
              'ml-2 inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium',
              complaintDetail.handleStatus === 'processing'
                ? 'bg-warning-50 text-warning-700 border border-warning-200'
                : 'bg-success-50 text-success-700 border border-success-200'
            )}>
              {complaintDetail.handleStatusLabel}
            </span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-4 gap-5">
              <div>
                <div className="text-xs text-neutral-500 mb-1">涉诉编号</div>
                <div className="text-sm font-mono font-semibold text-neutral-800">{complaintDetail.complaintId}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">关联投诉类型</div>
                <div className="text-sm font-medium text-neutral-800">{complaintDetail.complaintType}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">投诉时间</div>
                <div className="text-sm font-medium text-neutral-800">
                  {new Date(complaintDetail.complaintTime).toLocaleDateString('zh-CN')}
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">处理状态</div>
                <div className={cn(
                  'text-sm font-medium',
                  complaintDetail.handleStatus === 'processing' ? 'text-warning-600' : 'text-success-600'
                )}>
                  {complaintDetail.handleStatusLabel}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <div className="text-xs text-neutral-500 mb-2">关联风险条款（停留时间最长）</div>
              <div className="flex flex-wrap gap-2">
                {complaintDetail.riskTerms.map((term, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-medium bg-danger-50 text-danger-700 border border-danger-200"
                  >
                    <AlertTriangle size={10} className="mr-1" />
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-20 gap-5">
        <div className="col-span-13">
          <div className="bg-white border border-neutral-200 rounded-sm shadow-paper overflow-hidden">
            <div className="px-5 py-3 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary-600" />
                <span className="text-sm font-semibold text-neutral-800">签署时模板快照</span>
                <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-sm">
                  A4 / {template?.categoryName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                <Eye size={12} />
                与签署时内容完全一致，不可篡改
              </div>
            </div>
            <div className="p-8 bg-neutral-100">
              <div
                className="mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-[60px]"
                style={{ width: '100%', maxWidth: '595px', minHeight: '842px' }}
              >
                <div className="text-center mb-8 pb-6 border-b-2 border-neutral-800">
                  <h2 className="text-xl font-bold text-neutral-900 font-serif tracking-wider mb-1">
                    {template?.name}
                  </h2>
                  <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-neutral-500">
                    <span>模板版本：v{signature.templateVersion}</span>
                    <span>编号：{template?.id.toUpperCase()}</span>
                  </div>
                </div>

                <div className="mb-5 text-sm text-neutral-700 leading-relaxed">
                  <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-sm text-xs">
                    <div>
                      <span className="text-neutral-500">顾客姓名：</span>
                      <span className="font-medium text-neutral-800">{maskName(signature.customerName)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">年龄：</span>
                      <span className="font-medium text-neutral-800">
                        {signature.age}岁
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-neutral-500">身份证号：</span>
                      <span className="font-mono font-medium text-neutral-800">
                        {maskIdCard(signature.customerIdCard)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">就诊项目：</span>
                      <span className="font-medium text-neutral-800">{signature.projectName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">日期：</span>
                      <span className="font-medium text-neutral-800">
                        {new Date(signature.signedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {paragraphs.map((paragraph, idx) => (
                    <ParagraphBlock
                      key={paragraph.id}
                      paragraph={paragraph}
                      index={idx}
                      isActive={activeParagraphId === paragraph.id}
                      onHover={(pid) => setActiveParagraphId(pid)}
                      onLeave={() => setActiveParagraphId(null)}
                      reading={signature.paragraphReadings.find((r) => r.paragraphId === paragraph.id)}
                    />
                  ))}
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-200">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">求美者确认签字：</div>
                      <div className="h-14 border-b border-neutral-400 flex items-end justify-center pb-1">
                        <div
                          className="text-2xl font-serif text-neutral-800"
                          style={{
                            fontFamily: '"Ma Shan Zheng", "Kaiti", "KaiTi", cursive',
                            transform: 'rotate(-3deg)',
                          }}
                        >
                          {maskName(signature.customerName)}
                        </div>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-1 text-center">电子签名，已完成验证</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">医师/咨询师签字：</div>
                      <div className="h-14 border-b border-neutral-400 flex items-end justify-center pb-1">
                        <div
                          className="text-xl font-serif text-neutral-700"
                          style={{
                            fontFamily: '"Ma Shan Zheng", "Kaiti", "KaiTi", cursive',
                          }}
                        >
                          {signature.consultantName}
                        </div>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-1 text-center">
                        {new Date(signature.signedAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-7 space-y-5">
          <div className="bg-white border border-neutral-200 rounded-sm shadow-paper overflow-hidden">
            <div className="px-5 py-3 bg-gradient-to-r from-primary-50/50 to-white border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-primary-600" />
                <span className="text-sm font-semibold text-neutral-800">讲解与确认时间轴</span>
              </div>
              <span className="text-[11px] text-neutral-500">{timelineActions.length} 个节点</span>
            </div>
            <div className="p-5 max-h-[360px] overflow-y-auto">
              <div className="relative pl-6">
                <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-primary-200 via-warning-200 via-success-200 to-danger-200" />
                {timelineActions.map((action, idx) => (
                  <div
                    key={action.id}
                    className={cn(
                      'relative mb-5 last:mb-0 cursor-pointer group',
                      action.paragraphId && activeParagraphId === action.paragraphId
                        ? 'scale-[1.01]'
                        : ''
                    )}
                    onMouseEnter={() => action.paragraphId && setActiveParagraphId(action.paragraphId)}
                    onMouseLeave={() => setActiveParagraphId(null)}
                  >
                    <div
                      className={cn(
                        'absolute -left-6 top-0 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-white shadow-md z-10 transition-all',
                        actionColor(action.type),
                        action.paragraphId && activeParagraphId === action.paragraphId
                          ? 'ring-4 ring-offset-2 ring-primary-200'
                          : ''
                      )}
                    >
                      {actionIcon(action.type)}
                    </div>
                    <div
                      className={cn(
                        'ml-2 p-3 rounded-sm border transition-all',
                        action.paragraphId && activeParagraphId === action.paragraphId
                          ? 'bg-primary-50 border-primary-200 shadow-sm'
                          : 'bg-neutral-50/70 border-neutral-200 group-hover:bg-neutral-50'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-neutral-800">
                          {action.label}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {formatTime(action.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 leading-relaxed mb-1.5">
                        {action.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1.5 border-t border-dashed border-neutral-200">
                        <UserCheck size={10} className="text-neutral-400" />
                        <span className="text-[10px] text-neutral-500">操作人：{action.operator}</span>
                        {action.paragraphId && (
                          <>
                            <span className="text-neutral-200">|</span>
                            <ChevronRight size={10} className="text-neutral-400" />
                            <span className="text-[10px] text-primary-600">联动预览</span>
                          </>
                        )}
                      </div>
                    </div>
                    {idx < timelineActions.length - 1 && (
                      <div className="absolute -left-[7px] top-[22px] w-[14px] h-[calc(100%+8px)]">
                        <svg width="14" height="100%" className="overflow-visible">
                          <path
                            d="M7 0 Q7 10 7 20 T7 40"
                            stroke="transparent"
                            strokeWidth="2"
                            strokeDasharray="3,3"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-sm shadow-paper overflow-hidden">
            <div className="px-5 py-3 bg-gradient-to-r from-warning-50/50 to-white border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-warning-600" />
                <span className="text-sm font-semibold text-neutral-800">条款停留时长统计</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                <Clock size={11} />
                合计 {totalReadingSeconds}s
              </div>
            </div>
            <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-neutral-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-neutral-600 font-medium border-b border-neutral-200">
                      段落名称
                    </th>
                    <th className="px-3 py-2.5 text-center text-neutral-600 font-medium border-b border-neutral-200 w-[70px]">
                      停留
                    </th>
                    <th className="px-3 py-2.5 text-center text-neutral-600 font-medium border-b border-neutral-200 w-[60px]">
                      回看
                    </th>
                    <th className="px-3 py-2.5 text-center text-neutral-600 font-medium border-b border-neutral-200 w-[70px]">
                      滚动
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {signature.paragraphReadings.map((reading, idx) => {
                    const para = paragraphs.find((p) => p.id === reading.paragraphId);
                    const scrollDepth = 60 + Math.floor(Math.random() * 40);
                    return (
                      <tr
                        key={reading.paragraphId}
                        className={cn(
                          'border-b border-neutral-100 last:border-b-0 transition-colors cursor-pointer',
                          activeParagraphId === reading.paragraphId
                            ? 'bg-primary-50'
                            : 'hover:bg-neutral-50'
                        )}
                        onMouseEnter={() => setActiveParagraphId(reading.paragraphId)}
                        onMouseLeave={() => setActiveParagraphId(null)}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-600 flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-neutral-700 truncate text-[11px]">
                              {reading.paragraphTitle}
                            </span>
                            {para?.isRiskHighlight && (
                              <AlertTriangle size={10} className="text-danger-500 flex-shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={cn(
                              'inline-flex px-2 py-0.5 rounded-sm font-medium',
                              reading.duration < 20
                                ? 'bg-danger-50 text-danger-700'
                                : reading.duration < 45
                                ? 'bg-warning-50 text-warning-700'
                                : 'bg-success-50 text-success-700'
                            )}
                          >
                            {reading.duration}s
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={cn(
                            reading.scrollCount > 2 ? 'text-warning-600' : 'text-neutral-600'
                          )}>
                            {reading.scrollCount}次
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-10 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  scrollDepth >= 90
                                    ? 'bg-success-500'
                                    : scrollDepth >= 70
                                    ? 'bg-primary-500'
                                    : 'bg-warning-500'
                                )}
                                style={{ width: `${scrollDepth}%` }}
                              />
                            </div>
                            <span className="text-neutral-600 font-mono text-[10px]">
                              {scrollDepth}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-sm shadow-paper overflow-hidden">
            <div className="px-5 py-3 bg-gradient-to-r from-danger-50/50 to-white border-b border-neutral-200 flex items-center gap-2">
              <PenLine size={16} className="text-danger-600" />
              <span className="text-sm font-semibold text-neutral-800">手写签名展示</span>
            </div>
            <div className="p-5">
              <div className="relative bg-gradient-to-br from-neutral-50 to-white border-2 border-dashed border-neutral-200 rounded-sm p-6 min-h-[120px] flex items-center justify-center">
                <div className="absolute top-2 left-2 text-[10px] text-neutral-400 flex items-center gap-1">
                  <ShieldCheck size={10} />
                  已通过签名验证
                </div>
                <div className="absolute top-2 right-2 text-[10px] text-neutral-400">
                  {new Date(signature.signedAt).toLocaleString('zh-CN')}
                </div>
                <div
                  className="text-5xl font-serif text-neutral-800 relative"
                  style={{
                    fontFamily: '"Ma Shan Zheng", "Kaiti", "KaiTi", cursive',
                    transform: 'rotate(-5deg)',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.05)',
                  }}
                >
                  {maskName(signature.customerName)}
                  <svg
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                    width="120"
                    height="12"
                    viewBox="0 0 120 12"
                    fill="none"
                  >
                    <path
                      d="M2 8 Q30 2 60 6 T118 5"
                      stroke="#8B2635"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.6"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-center">
                <div className="p-2 bg-neutral-50 rounded-sm">
                  <div className="text-neutral-500 mb-0.5">签名IP</div>
                  <div className="font-mono text-neutral-700">192.168.1.{50 + Math.floor(Math.random() * 200)}</div>
                </div>
                <div className="p-2 bg-neutral-50 rounded-sm">
                  <div className="text-neutral-500 mb-0.5">设备指纹</div>
                  <div className="font-mono text-neutral-700 truncate">A{(Math.random().toString(36).substr(2, 8)).toUpperCase()}</div>
                </div>
                <div className="p-2 bg-neutral-50 rounded-sm">
                  <div className="text-neutral-500 mb-0.5">签署地点</div>
                  <div className="text-neutral-700 truncate">{signature.storeName.slice(0, 4)}...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-sm text-white shadow-paper">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <RotateCcw size={15} />
            <span>本档案采用区块链存证，具备完整法律效力</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2 text-sm bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-sm transition-colors flex items-center gap-1.5">
            <Printer size={14} />
            打印
          </button>
          <button className="px-6 py-2 text-sm font-medium bg-white text-primary-700 hover:bg-primary-50 rounded-sm transition-colors shadow-sm flex items-center gap-1.5">
            <Download size={14} />
            导出完整档案PDF
          </button>
        </div>
      </div>
    </div>
  );
}

interface ParagraphBlockProps {
  paragraph: TemplateParagraph;
  index: number;
  isActive: boolean;
  onHover: (id: string) => void;
  onLeave: () => void;
  reading?: { duration: number; scrollCount: number; confirmAction: boolean };
}

function ParagraphBlock({ paragraph, isActive, onHover, onLeave, reading }: ParagraphBlockProps) {
  return (
    <div
      className={cn(
        'relative p-4 rounded-sm transition-all duration-200 border',
        paragraph.isRiskHighlight
          ? 'bg-[#FFF8F0] border-[#FFE0B2]'
          : 'bg-white border-neutral-100',
        isActive && [
          'ring-2 ring-primary-400 ring-offset-2 -translate-y-0.5 shadow-md',
          paragraph.isRiskHighlight ? 'ring-warning-400' : '',
        ]
      )}
      onMouseEnter={() => onHover(paragraph.id)}
      onMouseLeave={onLeave}
    >
      {paragraph.isRiskHighlight && (
        <div className="absolute -top-2.5 left-3 flex items-center gap-1 px-2 py-0.5 bg-[#E65100] text-white text-[10px] rounded-sm shadow-sm">
          <AlertTriangle size={10} />
          重点风险条款
        </div>
      )}

      {reading && (
        <div className="absolute -top-2.5 right-3 flex items-center gap-2 px-2 py-0.5 bg-white border border-neutral-200 text-[10px] rounded-sm shadow-sm">
          <span className="text-neutral-500">停留</span>
          <span
            className={cn(
              'font-semibold',
              reading.duration < 20
                ? 'text-danger-600'
                : reading.duration < 45
                ? 'text-warning-600'
                : 'text-success-600'
            )}
          >
            {reading.duration}s
          </span>
          {reading.confirmAction && (
            <ShieldCheck size={10} className="text-success-500 ml-0.5" />
          )}
        </div>
      )}

      <h3
        className={cn(
          'font-semibold mb-3',
          paragraph.isRiskHighlight ? 'text-[#BF360C] text-sm' : 'text-neutral-800 text-sm'
        )}
      >
        {paragraph.title}
      </h3>

      <div
        className="text-[13px] leading-7 text-neutral-700"
        dangerouslySetInnerHTML={{ __html: paragraph.content }}
      />
    </div>
  );
}
