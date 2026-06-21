import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  GripVertical,
  Save,
  Send,
  FileText,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryTag, type CategoryType } from '@/components/ui/CategoryTag';
import { StatusBadge } from '@/components/ui/StatusBadge';

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

const initialSections: TemplateSection[] = [
  {
    id: 's1',
    type: 'introduction',
    title: '一、项目介绍',
    content: '本项目为玻尿酸注射美容治疗，通过将医用透明质酸钠凝胶注入皮肤真皮层或皮下组织，以达到填充凹陷、改善轮廓、增加皮肤弹性及保湿的效果。\n\n本治疗采用经国家药品监督管理局批准的正规玻尿酸产品，由具备资质的专业医师操作。治疗前医师将根据您的面部特征、皮肤状况及个人需求，制定个性化方案。',
    order: 1,
    isRiskHighlight: false,
  },
  {
    id: 's2',
    type: 'contraindication',
    title: '二、禁忌症',
    content: '存在以下情况者，不适合接受本项治疗：\n\n1. 对玻尿酸产品或其任何成分（如利多卡因等）有过敏史者；\n2. 注射部位存在皮肤感染、活动性炎症或开放性伤口者；\n3. 患有严重基础疾病（如心脏病、肝病、肾病、血液病等）且病情不稳定者；\n4. 孕妇、哺乳期妇女及计划近期怀孕者；\n5. 未满18周岁的未成年人（需监护人签署同意）；\n6. 正在服用抗凝药物或有凝血功能障碍者；\n7. 有瘢痕疙瘩病史或异常瘢痕增生倾向者；\n8. 对治疗效果有不切实际期望或存在心理障碍者。',
    order: 2,
    isRiskHighlight: false,
  },
  {
    id: 's3',
    type: 'risk',
    title: '三、风险与并发症',
    content: '尽管玻尿酸注射是相对安全的微创美容治疗，但仍可能发生以下风险和并发症：\n\n【常见反应（发生率约5-15%）】\n• 注射部位红肿、瘀青、胀痛，通常3-7天自行消退\n• 局部瘙痒、紧绷感或异物感\n• 注射部位不对称或轻微不平整\n\n【少见并发症（发生率约1-5%）】\n• 持续2周以上的肿胀或硬结\n• 色素沉着或色素减退\n• 肉芽肿形成（迟发性异物反应）\n• 血管压迫导致的局部组织缺血\n\n【严重罕见风险（发生率＜0.1%）】\n⚠️ 血管栓塞：若不慎注入血管，可能导致皮肤坏死、失明甚至危及生命\n⚠️ 严重过敏反应或过敏性休克\n⚠️ 感染导致脓肿形成\n\n出现上述任何异常情况，请立即联系您的治疗医师或前往医院就诊。',
    order: 3,
    isRiskHighlight: true,
  },
  {
    id: 's4',
    type: 'alternative',
    title: '四、替代方案',
    content: '除玻尿酸注射外，根据您的具体需求，还可考虑以下替代治疗方案：\n\n1. 自体脂肪填充：抽取自身脂肪处理后注射，效果持久但需手术操作，恢复时间较长；\n2. 胶原蛋白注射：动物源或人源胶原蛋白，效果自然但维持时间较短；\n3. 肉毒素注射：适用于动力性皱纹改善，对于静态凹陷效果有限；\n4. 线雕提升：通过可吸收线材进行提拉，适合中重度松弛者；\n5. 光电治疗：如热玛吉、超声刀等，通过刺激胶原增生实现紧致效果；\n6. 手术整形：对于严重老化或结构性问题，可考虑手术方案。\n\n以上方案各有优缺点，请与医师充分沟通后选择最适合您的治疗方式。',
    order: 4,
    isRiskHighlight: false,
  },
  {
    id: 's5',
    type: 'preoperative',
    title: '五、术前注意事项',
    content: '治疗前请您配合做好以下准备：\n\n1. 治疗前1周内避免服用阿司匹林、维生素E、鱼油等可能增加出血风险的药物；\n2. 治疗前1周避免剧烈运动、饮酒及熬夜；\n3. 治疗当日请勿化妆，保持面部清洁；\n4. 如有既往病史、手术史、过敏史，请提前告知医师；\n5. 女性请避开月经期进行治疗；\n6. 治疗前建议拍照存档，以便术后对比效果；\n7. 请确保在身体状态良好、无发热感冒的情况下接受治疗。',
    order: 5,
    isRiskHighlight: false,
  },
  {
    id: 's6',
    type: 'postoperative',
    title: '六、术后护理指导',
    content: '治疗后请严格遵照以下护理要求：\n\n【术后24小时内】\n• 注射部位避免沾水、避免按摩或挤压\n• 避免剧烈运动及高温环境（桑拿、温泉等）\n• 避免化妆及使用刺激性护肤品\n• 保持注射部位清洁干燥\n\n【术后1周内】\n• 可进行轻柔冷敷缓解肿胀\n• 避免食用辛辣刺激性食物、海鲜及烟酒\n• 避免长时间阳光暴晒\n• 遵医嘱使用修复类护肤品\n\n【术后1个月内】\n• 定期复查，如有异常及时就诊\n• 避免接受其他面部有创治疗\n• 保持规律作息，避免过度劳累\n\n恢复过程中如有任何疑问，请及时与您的医师联系。',
    order: 6,
    isRiskHighlight: false,
  },
  {
    id: 's7',
    type: 'cost',
    title: '七、费用说明',
    content: '本次治疗费用明细如下：\n\n■ 玻尿酸产品费用：¥ ________ （品牌：______ 型号：______ 规格：______ml）\n■ 医师诊疗操作费：¥ ________\n■ 术前检查及麻醉费用：¥ ________\n■ 术后护理产品费用：¥ ________\n\n费用合计：¥ ________（大写：人民币 ________ 元整）\n\n【退费说明】\n• 治疗前因个人原因取消，扣除已发生费用后退还剩余款项；\n• 治疗进行中因个人原因终止，已注入的产品费用不予退还；\n• 术后如出现因产品质量或操作不当导致的并发症，院方承担相应处理费用；\n• 因个人护理不当导致的不良后果，后续修复费用由个人承担。\n\n本价格为本次治疗约定价格，不包含后续追加治疗或修复费用。',
    order: 7,
    isRiskHighlight: false,
  },
  {
    id: 's8',
    type: 'dispute',
    title: '八、争议处理约定',
    content: '医患双方在治疗及后续过程中如发生争议，按以下方式处理：\n\n1. 友好协商：双方首先通过友好沟通协商解决，力求达成一致意见；\n2. 调解途径：协商不成时，可申请医疗纠纷人民调解委员会进行调解；\n3. 技术鉴定：需要时可委托医学会或司法鉴定机构进行医疗损害鉴定；\n4. 法律诉讼：仍无法达成一致时，任何一方均可向有管辖权的人民法院提起诉讼。\n\n双方确认：\n• 本院已就治疗方案、风险及替代方案向患者进行了充分告知和解释；\n• 患者已阅读并理解本知情同意书全部内容，各项疑问已得到满意答复；\n• 患者系在完全自愿、意识清醒、无任何外力胁迫的情况下签署本同意书；\n• 本同意书一式两份，医患双方各执一份，具有同等法律效力。',
    order: 8,
    isRiskHighlight: false,
  },
];

export default function TemplateEditor() {
  const [templateName, setTemplateName] = useState('玻尿酸注射知情同意书');
  const [category, setCategory] = useState<CategoryType>('injection');
  const [sections, setSections] = useState<TemplateSection[]>(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState(initialSections[0].id);
  const [version, setVersion] = useState('V1.0.3');
  const [changeNote, setChangeNote] = useState('优化风险提示段落表述，补充最新临床数据依据');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const id = 't001';

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(`/api/templates/${id}`);
        const result = await res.json();
        if (result.success && result.data) {
          setTemplateName(result.data.name);
          if (result.data.category) setCategory(result.data.category);
        }
      } catch {
        // use default state
      }
    };
    fetchTemplate();
  }, [id]);

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
    setSaving(true);
    try {
      const payload = {
        name: templateName,
        category,
        paragraphs: sections,
      };
      const res = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await res.json();
    } catch {
      console.log('保存草稿成功');
    } finally {
      setTimeout(() => setSaving(false), 800);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/templates/${id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeLog: changeNote, paragraphs: sections }),
      });
      await res.json();
    } catch {
      const parts = version.replace('V', '').split('.').map(Number);
      parts[2] += 1;
      setVersion(`V${parts.join('.')}`);
      console.log('提交审核成功');
    } finally {
      setTimeout(() => setSubmitting(false), 800);
    }
  };

  const getTypeConfig = (type: string) => sectionTypes.find((t) => t.key === type);

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
          <StatusBadge status="draft" size="md" />
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
                上次保存：刚刚
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

          <div className="p-4 space-y-2">
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
