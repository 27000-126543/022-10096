export type UserRole = 'legal' | 'medical' | 'store'

export interface User {
  id: string
  name: string
  role: UserRole
  title: string
  department: string
  avatar: string
  email: string
  phone: string
}

export type TemplateCategory = 'injection' | 'skin' | 'plastic' | 'antiaging'

export type TemplateStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published'

export interface TemplateParagraph {
  id: string
  title: string
  order: number
  type: 'intro' | 'contraindication' | 'alternative' | 'postcare' | 'dispute' | 'custom'
  content: string
  isRiskHighlight: boolean
}

export interface TemplateVersion {
  id: string
  version: string
  templateId: string
  paragraphs: TemplateParagraph[]
  changeLog: string
  createdAt: string
  createdBy: string
  isPublished: boolean
}

export interface Template {
  id: string
  name: string
  category: TemplateCategory
  categoryName: string
  status: TemplateStatus
  tags: string[]
  currentVersionId: string
  versions: TemplateVersion[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface Project {
  id: string
  name: string
  categoryId: TemplateCategory
  categoryName: string
  parentId: string | null
  level: number
  sort: number
  mappedTemplateVersions: {
    type: 'adult' | 'minor' | 'retreatment'
    templateId: string
    versionId: string
    version: string
  }[]
}

export type ReviewDecision = 'approved' | 'rejected'

export interface ReviewRecord {
  id: string
  templateId: string
  templateName: string
  versionId: string
  version: string
  submitterId: string
  submitterName: string
  submitTime: string
  reviewerId: string | null
  reviewerName: string | null
  reviewTime: string | null
  status: 'pending' | 'approved' | 'rejected'
  decision: ReviewDecision | null
  opinion: string | null
  changeSummary: string
}

export type Region = 'north' | 'east' | 'south' | 'west' | 'central'

export interface Store {
  id: string
  name: string
  region: Region
  regionName: string
  city: string
  address: string
  phone: string
  manager: string
  isActive: boolean
  createdAt: string
}

export type DeployStatus = 'active' | 'scheduled' | 'withdrawn'

export interface DeployRecord {
  id: string
  templateId: string
  templateName: string
  versionId: string
  version: string
  region: Region[]
  storeIds: string[]
  storeNames: string[]
  status: DeployStatus
  deployType: 'immediate' | 'scheduled'
  scheduledAt: string | null
  deployedAt: string
  withdrawnAt: string | null
  deployedBy: string
  deployNote: string
}

export type SignatureStatus = 'normal' | 'resigned'

export interface ParagraphReading {
  paragraphId: string
  paragraphTitle: string
  duration: number
  scrollCount: number
  confirmAction: boolean
  confirmAt: string | null
}

export interface SignatureRecord {
  id: string
  customerName: string
  customerPhone: string
  customerIdCard: string
  age: number
  isMinor: boolean
  isRetreatment: boolean
  projectId: string
  projectName: string
  templateId: string
  templateName: string
  templateCategory: TemplateCategory
  templateVersionId: string
  templateVersion: string
  storeId: string
  storeName: string
  region: Region
  regionName: string
  consultantId: string
  consultantName: string
  status: SignatureStatus
  totalReadingTime: number
  paragraphReadings: ParagraphReading[]
  signatureImage: string
  signedAt: string
}

export interface RiskTermStats {
  paragraphId: string
  paragraphTitle: string
  templateId: string
  templateName: string
  templateCategory: TemplateCategory
  avgDuration: number
  skipRate: number
  reviewCount: number
  signatureCount: number
}

export interface ReSignStats {
  projectId: string
  projectName: string
  category: TemplateCategory
  totalSignatures: number
  resignedCount: number
  resignRate: number
}

export interface ComplaintAssociation {
  id: string
  projectId: string
  projectName: string
  templateId: string
  templateVersionId: string
  paragraphId: string
  paragraphTitle: string
  complaintCount: number
  associatedSignatures: number
}

export interface AnalyticsSummary {
  totalSignatures: number
  totalTemplates: number
  totalStores: number
  pendingReviews: number
  resignRate: number
  avgReadingTime: number
  complaintCount: number
  monthlySignatures: { month: string; count: number }[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
  total?: number
  page?: number
  pageSize?: number
}

export const users: User[] = [
  {
    id: 'u001',
    name: '李晓明',
    role: 'legal',
    title: '法务专员',
    department: '总部法务部',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=%E6%9D%8E%E6%99%93%E6%98%8E',
    email: 'lixiaoming@yimei.com',
    phone: '13800138001'
  },
  {
    id: 'u002',
    name: '王建国',
    role: 'medical',
    title: '医务主任',
    department: '总部医务部',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=%E7%8E%8B%E5%BB%BA%E5%9B%BD',
    email: 'wangjianguo@yimei.com',
    phone: '13800138002'
  },
  {
    id: 'u003',
    name: '张美丽',
    role: 'store',
    title: '门店院长',
    department: '北京朝阳门店',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=%E5%BC%A0%E7%BE%8E%E4%B8%BD',
    email: 'zhangmeili@yimei.com',
    phone: '13800138003'
  }
]

const categoryMap: Record<TemplateCategory, string> = {
  injection: '注射美容',
  skin: '皮肤美容',
  plastic: '整形外科',
  antiaging: '抗衰管理'
}

function makeParagraphs(category: TemplateCategory, templateName: string): TemplateParagraph[] {
  const base: TemplateParagraph[] = [
    {
      id: `p_${category}_1`,
      title: '一、项目介绍',
      order: 1,
      type: 'intro',
      content: `<h3>${templateName}项目介绍</h3><p>本项目是经过国家卫生健康委员会批准的正规医疗美容项目。我院已取得《医疗机构执业许可证》及相关科目开展资质，操作医师均持有《医师资格证书》和《医师执业证书》，具有丰富的临床经验。</p><p><strong>项目定义：</strong>${templateName}是一种安全有效的医疗美容手段，旨在改善您的外观形象，提升自信心。治疗过程将在严格的无菌操作环境下进行，使用的产品和器械均已通过国家药监局NMPA认证。</p><p><strong>适用人群：</strong>年满18周岁（特殊项目除外），身体健康，无严重器质性疾病，心理状态稳定，对治疗效果有合理预期的求美者。</p>`,
      isRiskHighlight: false
    },
    {
      id: `p_${category}_2`,
      title: '二、禁忌症说明',
      order: 2,
      type: 'contraindication',
      content: `<h3>禁忌症与不适应人群</h3><p style="background-color:#FFF3E0; padding:10px; border-left:3px solid #E65100;"><strong>【重要风险提示】</strong>请您务必如实告知以下情况，隐瞒病史可能导致严重后果，由求美者自行承担责任。</p><ul><li><strong>绝对禁忌症：</strong><ul><li>严重心、肝、肾、肺等重要脏器疾病或功能不全者</li><li>凝血功能障碍、出血性疾病或正在服用抗凝药物者</li><li>未控制的糖尿病、甲状腺疾病等内分泌系统疾病</li><li>孕期、哺乳期及月经期女性</li><li>治疗区域有活动性感染、开放性伤口或皮肤病急性期</li><li>对治疗所用药物或材料有明确过敏史者</li><li>免疫系统疾病或长期使用免疫抑制剂者</li></ul></li><li><strong>相对禁忌症：</strong><ul><li>瘢痕体质（需医生评估）</li><li>近期（3个月内）接受过同类治疗</li><li>精神状态不稳定或对治疗效果有不切实际期望</li><li>嗜烟酗酒者</li></ul></li></ul>`,
      isRiskHighlight: true
    },
    {
      id: `p_${category}_3`,
      title: '三、可能出现的风险与并发症',
      order: 3,
      type: 'contraindication',
      content: `<h3>治疗风险与并发症告知</h3><p style="background-color:#FFF3E0; padding:10px; border-left:3px solid #E65100;"><strong>【重点风险条款】</strong>医疗美容存在医疗风险，即使医师已采取所有合理措施，以下情况仍有可能发生，请您充分知悉并自愿承担：</p><ol><li><strong>局部反应：</strong>治疗后可能出现局部红肿、胀痛、淤青、瘙痒等反应，一般持续1-7天可自行消退，特殊情况可能延长至2-4周</li><li><strong>感染风险：</strong>虽然严格无菌操作，仍存在极低概率的感染可能，表现为持续红肿热痛、化脓发热，需及时复诊处理</li><li><strong>过敏反应：</strong>少数人群可能出现局部或全身过敏，表现为皮疹、瘙痒、呼吸困难等，严重者需紧急就医</li><li><strong>效果不确定性：</strong>治疗效果存在个体差异，与个人体质、年龄、生活习惯、术后护理等因素密切相关，最终效果可能与预期存在偏差</li><li><strong>色素异常：</strong>治疗区域可能出现暂时性色素沉着或色素减退，多数可在3-6个月内恢复，极少数可能持续较长时间</li><li><strong>瘢痕形成：</strong>有创治疗可能遗留瘢痕，瘢痕体质者风险更高，术后需规范使用抗瘢痕药物</li><li><strong>血管神经损伤：</strong>虽然发生率极低，但注射类项目存在误入血管导致血管栓塞、皮肤坏死甚至视力障碍的严重风险</li><li><strong>材料相关反应：</strong>植入/注射材料可能出现移位、硬结、肉芽肿等远期并发症</li></ol>`,
      isRiskHighlight: true
    },
    {
      id: `p_${category}_4`,
      title: '四、替代治疗方案',
      order: 4,
      type: 'alternative',
      content: `<h3>替代治疗方案选择</h3><p>针对您的需求，医师向您充分告知了以下可行的治疗方案，您已了解各方案的优缺点并自主选择本方案：</p><table border="1" cellpadding="8" style="border-collapse:collapse; width:100%;"><tr style="background-color:#f5f5f5;"><th>方案类型</th><th>方案说明</th><th>优势</th><th>劣势/风险</th><th>参考价格</th></tr><tr><td><strong>您选择的方案</strong></td><td>${templateName}</td><td>效果确切、恢复较快、技术成熟</td><td>存在前述医疗风险</td><td>¥5,000-20,000</td></tr><tr><td>方案二</td><td>非侵入性光电治疗</td><td>无创口、恢复快、风险低</td><td>效果温和、需多次治疗、维持时间短</td><td>¥3,000-15,000/次</td></tr><tr><td>方案三</td><td>手术类治疗</td><td>效果持久、改善明显</td><td>创伤大、恢复期长、风险较高</td><td>¥15,000-80,000</td></tr><tr><td>方案四</td><td>日常护理/护肤品</td><td>无医疗风险、费用低</td><td>改善有限、需长期坚持</td><td>¥500-3,000/月</td></tr></table><p>您确认：医师已向您详细解释了各方案的区别，您的选择是完全自愿的。</p>`,
      isRiskHighlight: false
    },
    {
      id: `p_${category}_5`,
      title: '五、术前注意事项',
      order: 5,
      type: 'custom',
      content: `<h3>术前准备与注意事项</h3><ul><li>治疗前2周停止服用阿司匹林、维生素E、鱼油等可能增加出血风险的药物或保健品</li><li>治疗前1周避免暴晒、激光治疗、果酸换肤等</li><li>治疗当天请勿化妆，保持面部清洁</li><li>治疗当天穿着宽松、舒适的衣物，建议有人陪同</li><li>请携带本人有效身份证件以便登记</li><li>如正在服用任何药物，请务必告知医师</li><li>如有任何身体不适（如感冒、发烧等），请提前告知以便调整治疗时间</li><li>术前请避免饮酒、熬夜，保持良好的身体状态</li></ul>`,
      isRiskHighlight: false
    },
    {
      id: `p_${category}_6`,
      title: '六、术后护理须知',
      order: 6,
      type: 'postcare',
      content: `<h3>术后护理与康复指导</h3><p><strong>【术后24小时内】</strong></p><ul><li>治疗部位避免沾水，保持清洁干燥</li><li>可进行冷敷（每次15-20分钟，间隔1-2小时）减轻肿胀</li><li>避免剧烈运动、高温环境（桑拿、热水浴）</li><li>按医嘱使用外用药物</li></ul><p><strong>【术后1周内】</strong></p><ul><li>避免揉搓、按压治疗部位</li><li>饮食清淡，避免辛辣刺激食物、海鲜、牛羊肉等发物</li><li>禁烟禁酒</li><li>严格防晒（SPF30+以上，物理遮挡+防晒霜）</li><li>避免使用刺激性护肤品</li></ul><p><strong>【术后1-4周】</strong></p><ul><li>继续做好防晒和保湿</li><li>观察治疗效果，如有异常及时复诊</li><li>按医嘱时间回院复查</li><li>如出现持续红肿、疼痛加剧、发热等情况，请立即联系医院</li></ul><p style="background-color:#FFF3E0; padding:10px; border-left:3px solid #E65100;"><strong>提醒：</strong>术后护理对治疗效果至关重要，因护理不当导致的并发症或效果不佳，医院不承担责任。</p>`,
      isRiskHighlight: true
    },
    {
      id: `p_${category}_7`,
      title: '七、效果与费用说明',
      order: 7,
      type: 'custom',
      content: `<h3>治疗效果与费用</h3><p><strong>效果说明：</strong></p><ul><li>治疗效果因人而异，一般在1-4周逐渐显现，最佳效果可能需要1-3个月</li><li>维持时间因项目和个体差异不同，一般为6-18个月不等</li><li>如需保持效果，需根据医师建议进行定期维护治疗</li><li>如首次治疗效果不理想，可在医师指导下进行补充治疗（可能产生额外费用）</li></ul><p><strong>费用说明：</strong></p><ul><li>本次治疗费用为人民币 <strong>￥______元</strong>（大写：____________________）</li><li>费用包含：诊疗费、材料费、操作费、一次术后复诊费</li><li>费用不含：术后用药、异常情况处理费用、补充/二次治疗费用</li><li>因个人原因取消或终止治疗的，已产生的费用不予退还</li><li>治疗开始后因个人原因要求退费的，按已完成项目比例扣除后退还</li></ul>`,
      isRiskHighlight: false
    },
    {
      id: `p_${category}_8`,
      title: '八、争议处理与知情同意',
      order: 8,
      type: 'dispute',
      content: `<h3>争议处理与知情确认</h3><p><strong>一、知情确认声明：</strong></p><ol><li>本人已阅读并充分理解本知情同意书的全部内容</li><li>医师已就治疗方案、风险、替代方案等问题向本人作了详细说明和解释</li><li>本人有机会就任何疑问进行提问，且所有疑问均已获得满意解答</li><li>本人了解医疗美容不同于普通生活美容，存在不可预知的医疗风险</li><li>本人确认提供的个人健康信息真实准确，无隐瞒或虚假陈述</li><li>本人对治疗效果有合理预期，不要求医师保证特定效果</li></ol><p><strong>二、隐私授权：</strong></p><p>本人同意医院在保护个人隐私的前提下，将治疗前后对比照片、病例资料用于以下用途（可多选）：</p><ul><li>□ 医疗档案存档与复诊比对</li><li>□ 内部医疗质量评估与教学研究</li><li>□ 经处理后用于医学论文发表（不包含可识别个人信息）</li><li>□ 均不同意（仅用于医疗档案）</li></ul><p><strong>三、争议解决：</strong></p><p>如发生医疗争议，双方应首先友好协商解决；协商不成的，可向医疗纠纷人民调解委员会申请调解，或依法向人民法院提起诉讼。本同意书的签订不视为医院对治疗效果的承诺或保证。</p><p style="margin-top:30px;"><strong>四、签字确认：</strong></p><div style="display:flex; justify-content:space-between; margin-top:40px;"><div>求美者（监护人）签字：__________________<br/>日期：________年______月______日</div><div>医师签字：__________________<br/>日期：________年______月______日</div></div>`,
      isRiskHighlight: true
    }
  ]
  return base
}

function makeVersions(templateId: string, category: TemplateCategory, name: string, publishedVer: number | null, hasPending: boolean, hasDraft: boolean): TemplateVersion[] {
  const versions: TemplateVersion[] = []
  if (publishedVer !== null) {
    for (let i = 1; i <= publishedVer; i++) {
      versions.push({
        id: `${templateId}_v${i}`,
        version: `1.${i - 1}.0`,
        templateId,
        paragraphs: makeParagraphs(category, name),
        changeLog: i === 1 ? '初始版本创建' : `根据临床反馈优化第${i - 1}版内容，完善风险条款表述`,
        createdAt: new Date(2025, 11 - i, 15 + i).toISOString(),
        createdBy: 'u001',
        isPublished: i === publishedVer
      })
    }
  }
  if (hasPending) {
    versions.push({
      id: `${templateId}_vpending`,
      version: `1.${publishedVer || 0}.1`,
      templateId,
      paragraphs: makeParagraphs(category, name),
      changeLog: '优化禁忌症条款描述，增加术后护理图片说明',
      createdAt: new Date(2026, 5, 10).toISOString(),
      createdBy: 'u001',
      isPublished: false
    })
  }
  if (hasDraft) {
    versions.push({
      id: `${templateId}_vdraft`,
      version: `1.${(publishedVer || 0) + 1}.0`,
      templateId,
      paragraphs: makeParagraphs(category, name).slice(0, 5),
      changeLog: '',
      createdAt: new Date(2026, 5, 18).toISOString(),
      createdBy: 'u001',
      isPublished: false
    })
  }
  return versions
}

export const templates: Template[] = [
  {
    id: 't001',
    name: '玻尿酸面部填充知情同意书',
    category: 'injection',
    categoryName: categoryMap.injection,
    status: 'published',
    tags: ['玻尿酸', '填充', '面部'],
    currentVersionId: 't001_v2',
    versions: makeVersions('t001', 'injection', '玻尿酸面部填充', 2, true, false),
    createdAt: new Date(2025, 6, 1).toISOString(),
    updatedAt: new Date(2026, 5, 10).toISOString(),
    createdBy: 'u001',
    updatedBy: 'u001'
  },
  {
    id: 't002',
    name: '肉毒素注射知情同意书',
    category: 'injection',
    categoryName: categoryMap.injection,
    status: 'published',
    tags: ['肉毒素', '除皱', '瘦脸'],
    currentVersionId: 't002_v3',
    versions: makeVersions('t002', 'injection', '肉毒素注射', 3, false, false),
    createdAt: new Date(2025, 3, 10).toISOString(),
    updatedAt: new Date(2026, 4, 20).toISOString(),
    createdBy: 'u001',
    updatedBy: 'u001'
  },
  {
    id: 't003',
    name: '水光针治疗知情同意书',
    category: 'injection',
    categoryName: categoryMap.injection,
    status: 'pending',
    tags: ['水光针', '补水', '嫩肤'],
    currentVersionId: 't003_vpending',
    versions: makeVersions('t003', 'injection', '水光针治疗', 1, true, false),
    createdAt: new Date(2025, 8, 15).toISOString(),
    updatedAt: new Date(2026, 5, 15).toISOString(),
    createdBy: 'u001',
    updatedBy: 'u001'
  },
  {
    id: 't004',
    name: '热玛吉抗衰知情同意书',
    category: 'antiaging',
    categoryName: categoryMap.antiaging,
    status: 'published',
    tags: ['热玛吉', '射频', '紧肤'],
    currentVersionId: 't004_v2',
    versions: makeVersions('t004', 'antiaging', '热玛吉抗衰', 2, false, false),
    createdAt: new Date(2025, 5, 20).toISOString(),
    updatedAt: new Date(2026, 2, 10).toISOString(),
    createdBy: 'u001',
    updatedBy: 'u001'
  },
  {
    id: 't005',
    name: '线雕提升知情同意书',
    category: 'antiaging',
    categoryName: categoryMap.antiaging,
    status: 'draft',
    tags: ['线雕', '提升', '可吸收线'],
    currentVersionId: 't005_vdraft',
    versions: makeVersions('t005', 'antiaging', '线雕提升', null, false, true),
    createdAt: new Date(2026, 5, 16).toISOString(),
    updatedAt: new Date(2026, 5, 18).toISOString(),
    createdBy: 'u001',
    updatedBy: 'u001'
  },
  {
    id: 't006',
    name: '光子嫩肤知情同意书',
    category: 'skin',
    categoryName: categoryMap.skin,
    status: 'published',
    tags: ['光子', '嫩肤', '祛斑'],
    currentVersionId: 't006_v2',
    versions: makeVersions('t006', 'skin', '光子嫩肤', 2, false, false),
    createdAt: new Date(2025, 2, 28).toISOString(),
    updatedAt: new Date(2026, 1, 5).toISOString(),
    createdBy: 'u001',
    updatedBy: 'u001'
  },
  {
    id: 't007',
    name: '皮秒激光祛斑知情同意书',
    category: 'skin',
    categoryName: categoryMap.skin,
    status: 'rejected',
    tags: ['皮秒', '激光', '祛斑'],
    currentVersionId: 't007_vpending',
    versions: makeVersions('t007', 'skin', '皮秒激光祛斑', 1, true, false),
    createdAt: new Date(2025, 9, 8).toISOString(),
    updatedAt: new Date(2026, 5, 12).toISOString(),
    createdBy: 'u001',
    updatedBy: 'u001'
  },
  {
    id: 't008',
    name: '双眼皮手术知情同意书',
    category: 'plastic',
    categoryName: categoryMap.plastic,
    status: 'published',
    tags: ['双眼皮', '眼综合', '手术'],
    currentVersionId: 't008_v4',
    versions: makeVersions('t008', 'plastic', '双眼皮手术', 4, false, false),
    createdAt: new Date(2024, 10, 1).toISOString(),
    updatedAt: new Date(2026, 3, 25).toISOString(),
    createdBy: 'u001',
    updatedBy: 'u001'
  },
  {
    id: 't009',
    name: '隆鼻手术知情同意书',
    category: 'plastic',
    categoryName: categoryMap.plastic,
    status: 'published',
    tags: ['隆鼻', '假体', '手术'],
    currentVersionId: 't009_v3',
    versions: makeVersions('t009', 'plastic', '隆鼻手术', 3, true, false),
    createdAt: new Date(2025, 0, 10).toISOString(),
    updatedAt: new Date(2026, 5, 8).toISOString(),
    createdBy: 'u001',
    updatedBy: 'u001'
  },
  {
    id: 't010',
    name: '自体脂肪填充知情同意书',
    category: 'plastic',
    categoryName: categoryMap.plastic,
    status: 'pending',
    tags: ['自体脂肪', '填充', '吸脂'],
    currentVersionId: 't010_vpending',
    versions: makeVersions('t010', 'plastic', '自体脂肪填充', 2, true, false),
    createdAt: new Date(2025, 4, 18).toISOString(),
    updatedAt: new Date(2026, 5, 17).toISOString(),
    createdBy: 'u001',
    updatedBy: 'u001'
  }
]

export const projects: Project[] = [
  { id: 'prj001', name: '注射美容', categoryId: 'injection', categoryName: categoryMap.injection, parentId: null, level: 1, sort: 1, mappedTemplateVersions: [] },
  { id: 'prj002', name: '皮肤美容', categoryId: 'skin', categoryName: categoryMap.skin, parentId: null, level: 1, sort: 2, mappedTemplateVersions: [] },
  { id: 'prj003', name: '整形外科', categoryId: 'plastic', categoryName: categoryMap.plastic, parentId: null, level: 1, sort: 3, mappedTemplateVersions: [] },
  { id: 'prj004', name: '抗衰管理', categoryId: 'antiaging', categoryName: categoryMap.antiaging, parentId: null, level: 1, sort: 4, mappedTemplateVersions: [] },
  { id: 'prj005', name: '玻尿酸系列', categoryId: 'injection', categoryName: categoryMap.injection, parentId: 'prj001', level: 2, sort: 1, mappedTemplateVersions: [] },
  { id: 'prj006', name: '肉毒素系列', categoryId: 'injection', categoryName: categoryMap.injection, parentId: 'prj001', level: 2, sort: 2, mappedTemplateVersions: [] },
  { id: 'prj007', name: '中胚层疗法', categoryId: 'injection', categoryName: categoryMap.injection, parentId: 'prj001', level: 2, sort: 3, mappedTemplateVersions: [] },
  { id: 'prj008', name: '乔雅登丰颜', categoryId: 'injection', categoryName: categoryMap.injection, parentId: 'prj005', level: 3, sort: 1,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't001', versionId: 't001_v2', version: '1.1.0' }] },
  { id: 'prj009', name: '瑞蓝丽瑅', categoryId: 'injection', categoryName: categoryMap.injection, parentId: 'prj005', level: 3, sort: 2,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't001', versionId: 't001_v2', version: '1.1.0' }] },
  { id: 'prj010', name: '保妥适除皱', categoryId: 'injection', categoryName: categoryMap.injection, parentId: 'prj006', level: 3, sort: 1,
    mappedTemplateVersions: [
      { type: 'adult', templateId: 't002', versionId: 't002_v3', version: '1.2.0' },
      { type: 'retreatment', templateId: 't002', versionId: 't002_v3', version: '1.2.0' }
    ] },
  { id: 'prj011', name: '衡力瘦脸针', categoryId: 'injection', categoryName: categoryMap.injection, parentId: 'prj006', level: 3, sort: 2,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't002', versionId: 't002_v3', version: '1.2.0' }] },
  { id: 'prj012', name: '基础水光针', categoryId: 'injection', categoryName: categoryMap.injection, parentId: 'prj007', level: 3, sort: 1,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't003', versionId: 't003_v1', version: '1.0.0' }] },
  { id: 'prj013', name: '菲洛嘉动能素', categoryId: 'injection', categoryName: categoryMap.injection, parentId: 'prj007', level: 3, sort: 2,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't003', versionId: 't003_v1', version: '1.0.0' }] },
  { id: 'prj014', name: '光电治疗', categoryId: 'skin', categoryName: categoryMap.skin, parentId: 'prj002', level: 2, sort: 1, mappedTemplateVersions: [] },
  { id: 'prj015', name: '光子嫩肤M22', categoryId: 'skin', categoryName: categoryMap.skin, parentId: 'prj014', level: 3, sort: 1,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't006', versionId: 't006_v2', version: '1.1.0' }] },
  { id: 'prj016', name: '皮秒蜂巢', categoryId: 'skin', categoryName: categoryMap.skin, parentId: 'prj014', level: 3, sort: 2,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't007', versionId: 't007_v1', version: '1.0.0' }] },
  { id: 'prj017', name: '眼部整形', categoryId: 'plastic', categoryName: categoryMap.plastic, parentId: 'prj003', level: 2, sort: 1, mappedTemplateVersions: [] },
  { id: 'prj018', name: '鼻部整形', categoryId: 'plastic', categoryName: categoryMap.plastic, parentId: 'prj003', level: 2, sort: 2, mappedTemplateVersions: [] },
  { id: 'prj019', name: '体型雕塑', categoryId: 'plastic', categoryName: categoryMap.plastic, parentId: 'prj003', level: 2, sort: 3, mappedTemplateVersions: [] },
  { id: 'prj020', name: '全切双眼皮', categoryId: 'plastic', categoryName: categoryMap.plastic, parentId: 'prj017', level: 3, sort: 1,
    mappedTemplateVersions: [
      { type: 'adult', templateId: 't008', versionId: 't008_v4', version: '1.3.0' },
      { type: 'minor', templateId: 't008', versionId: 't008_v4', version: '1.3.0' }
    ] },
  { id: 'prj021', name: '埋线双眼皮', categoryId: 'plastic', categoryName: categoryMap.plastic, parentId: 'prj017', level: 3, sort: 2,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't008', versionId: 't008_v4', version: '1.3.0' }] },
  { id: 'prj022', name: '硅胶隆鼻', categoryId: 'plastic', categoryName: categoryMap.plastic, parentId: 'prj018', level: 3, sort: 1,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't009', versionId: 't009_v3', version: '1.2.0' }] },
  { id: 'prj023', name: '肋软骨综合隆鼻', categoryId: 'plastic', categoryName: categoryMap.plastic, parentId: 'prj018', level: 3, sort: 2,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't009', versionId: 't009_v3', version: '1.2.0' }] },
  { id: 'prj024', name: '腰腹吸脂', categoryId: 'plastic', categoryName: categoryMap.plastic, parentId: 'prj019', level: 3, sort: 1,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't010', versionId: 't010_v2', version: '1.1.0' }] },
  { id: 'prj025', name: '自体脂肪面部填充', categoryId: 'plastic', categoryName: categoryMap.plastic, parentId: 'prj019', level: 3, sort: 2,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't010', versionId: 't010_v2', version: '1.1.0' }] },
  { id: 'prj026', name: '射频抗衰', categoryId: 'antiaging', categoryName: categoryMap.antiaging, parentId: 'prj004', level: 2, sort: 1, mappedTemplateVersions: [] },
  { id: 'prj027', name: '线雕提升', categoryId: 'antiaging', categoryName: categoryMap.antiaging, parentId: 'prj004', level: 2, sort: 2, mappedTemplateVersions: [] },
  { id: 'prj028', name: '热玛吉四代', categoryId: 'antiaging', categoryName: categoryMap.antiaging, parentId: 'prj026', level: 3, sort: 1,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't004', versionId: 't004_v2', version: '1.1.0' }] },
  { id: 'prj029', name: '热玛吉五代FLX', categoryId: 'antiaging', categoryName: categoryMap.antiaging, parentId: 'prj026', level: 3, sort: 2,
    mappedTemplateVersions: [{ type: 'adult', templateId: 't004', versionId: 't004_v2', version: '1.1.0' }] },
  { id: 'prj030', name: '大V线提升', categoryId: 'antiaging', categoryName: categoryMap.antiaging, parentId: 'prj027', level: 3, sort: 1,
    mappedTemplateVersions: [] },
  { id: 'prj031', name: '小线精雕', categoryId: 'antiaging', categoryName: categoryMap.antiaging, parentId: 'prj027', level: 3, sort: 2,
    mappedTemplateVersions: [] }
]

export const reviewRecords: ReviewRecord[] = [
  {
    id: 'rv001',
    templateId: 't003',
    templateName: '水光针治疗知情同意书',
    versionId: 't003_vpending',
    version: '1.0.1',
    submitterId: 'u001',
    submitterName: '李晓明',
    submitTime: new Date(2026, 5, 15, 10, 30).toISOString(),
    reviewerId: null,
    reviewerName: null,
    reviewTime: null,
    status: 'pending',
    decision: null,
    opinion: null,
    changeSummary: '增加了联合治疗注意事项，优化了术后冰敷指导说明'
  },
  {
    id: 'rv002',
    templateId: 't010',
    templateName: '自体脂肪填充知情同意书',
    versionId: 't010_vpending',
    version: '1.2.1',
    submitterId: 'u001',
    submitterName: '李晓明',
    submitTime: new Date(2026, 5, 17, 14, 20).toISOString(),
    reviewerId: null,
    reviewerName: null,
    reviewTime: null,
    status: 'pending',
    decision: null,
    opinion: null,
    changeSummary: '完善脂肪存活率说明，增加吸脂部位感染风险提示'
  },
  {
    id: 'rv003',
    templateId: 't007',
    templateName: '皮秒激光祛斑知情同意书',
    versionId: 't007_vpending',
    version: '1.0.1',
    submitterId: 'u001',
    submitterName: '李晓明',
    submitTime: new Date(2026, 5, 10, 9, 15).toISOString(),
    reviewerId: 'u002',
    reviewerName: '王建国',
    reviewTime: new Date(2026, 5, 12, 16, 0).toISOString(),
    status: 'rejected',
    decision: 'rejected',
    opinion: '反黑期护理说明不够详细，需增加具体的修复产品推荐和使用周期；黄褐斑禁忌症需要单独列出，建议重新修改后再提交。',
    changeSummary: '增加了不同色斑类型的治疗效果差异说明'
  },
  {
    id: 'rv004',
    templateId: 't009',
    templateName: '隆鼻手术知情同意书',
    versionId: 't009_vpending',
    version: '1.2.1',
    submitterId: 'u001',
    submitterName: '李晓明',
    submitTime: new Date(2026, 5, 8, 11, 45).toISOString(),
    reviewerId: 'u002',
    reviewerName: '王建国',
    reviewTime: new Date(2026, 5, 10, 14, 30).toISOString(),
    status: 'approved',
    decision: 'approved',
    opinion: '同意。假体排异风险条款表述清晰，术后随访建议完善。',
    changeSummary: '新增了假体排异反应和远期移位的风险提示条款'
  },
  {
    id: 'rv005',
    templateId: 't001',
    templateName: '玻尿酸面部填充知情同意书',
    versionId: 't001_vpending',
    version: '1.1.1',
    submitterId: 'u001',
    submitterName: '李晓明',
    submitTime: new Date(2026, 5, 12, 15, 30).toISOString(),
    reviewerId: 'u002',
    reviewerName: '王建国',
    reviewTime: new Date(2026, 5, 14, 10, 0).toISOString(),
    status: 'approved',
    decision: 'approved',
    opinion: '同意。血管栓塞风险提示更加明确，增加了应急预案说明，很完善。',
    changeSummary: '增加了血管栓塞风险的详细说明和应急处理流程'
  }
]

const regionNames: Record<Region, string> = {
  north: '华北区',
  east: '华东区',
  south: '华南区',
  west: '西南区',
  central: '华中区'
}

function generateStores(): Store[] {
  const storeConfigs: Array<{ region: Region; city: string; names: string[] }> = [
    { region: 'north', city: '北京', names: ['北京朝阳旗舰店', '北京国贸分院', '北京海淀分院', '北京望京分院'] },
    { region: 'north', city: '天津', names: ['天津和平分院', '天津滨海分院'] },
    { region: 'east', city: '上海', names: ['上海浦东旗舰店', '上海静安分院', '上海徐汇分院', '上海虹桥分院'] },
    { region: 'east', city: '杭州', names: ['杭州西湖分院', '杭州钱江新城分院'] },
    { region: 'east', city: '南京', names: ['南京新街口分院'] },
    { region: 'south', city: '广州', names: ['广州天河旗舰店', '广州珠江新城分院', '广州白云分院'] },
    { region: 'south', city: '深圳', names: ['深圳南山旗舰店', '深圳福田分院', '深圳罗湖分院'] },
    { region: 'west', city: '成都', names: ['成都高新旗舰店', '成都锦江分院', '成都武侯分院'] },
    { region: 'west', city: '重庆', names: ['重庆江北分院', '重庆解放碑分院'] },
    { region: 'central', city: '武汉', names: ['武汉江汉路旗舰店', '武汉光谷分院'] },
    { region: 'central', city: '长沙', names: ['长沙芙蓉分院'] },
    { region: 'central', city: '郑州', names: ['郑州金水分院', '郑州二七分院'] }
  ]
  const stores: Store[] = []
  let id = 1
  storeConfigs.forEach(cfg => {
    cfg.names.forEach(name => {
      stores.push({
        id: `s${String(id).padStart(3, '0')}`,
        name,
        region: cfg.region,
        regionName: regionNames[cfg.region],
        city: cfg.city,
        address: `${cfg.city}市${cfg.region === 'north' || cfg.region === 'south' || cfg.region === 'east' || cfg.region === 'west' || cfg.region === 'central' ? '' : ''}${['人民路', '中心大道', '解放路', '建设路', '长江路'][id % 5]}${100 + id * 7}号${1 + (id % 5)}楼${100 + id}室`,
        phone: `400-888-${String(1000 + id).padStart(4, '0')}`,
        manager: ['王院长', '李院长', '张院长', '刘院长', '陈院长'][id % 5],
        isActive: true,
        createdAt: new Date(2024, (id % 12), 1 + (id % 28)).toISOString()
      })
      id++
    })
  })
  return stores
}

export const stores: Store[] = generateStores()

function generateDeploys(): DeployRecord[] {
  return [
    {
      id: 'dp001',
      templateId: 't002',
      templateName: '肉毒素注射知情同意书',
      versionId: 't002_v3',
      version: '1.2.0',
      region: ['north', 'east', 'south', 'west', 'central'],
      storeIds: stores.filter(s => s.isActive).map(s => s.id),
      storeNames: stores.filter(s => s.isActive).map(s => s.name),
      status: 'active',
      deployType: 'immediate',
      scheduledAt: null,
      deployedAt: new Date(2026, 4, 21, 9, 0).toISOString(),
      withdrawnAt: null,
      deployedBy: 'u002',
      deployNote: '全门店强制更新，优化了并发症说明条款'
    },
    {
      id: 'dp002',
      templateId: 't004',
      templateName: '热玛吉抗衰知情同意书',
      versionId: 't004_v2',
      version: '1.1.0',
      region: ['north', 'east', 'south'],
      storeIds: stores.filter(s => ['north', 'east', 'south'].includes(s.region)).map(s => s.id),
      storeNames: stores.filter(s => ['north', 'east', 'south'].includes(s.region)).map(s => s.name),
      status: 'active',
      deployType: 'immediate',
      scheduledAt: null,
      deployedAt: new Date(2026, 2, 12, 10, 30).toISOString(),
      withdrawnAt: null,
      deployedBy: 'u002',
      deployNote: '针对已开展热玛吉项目的门店发布'
    },
    {
      id: 'dp003',
      templateId: 't006',
      templateName: '光子嫩肤知情同意书',
      versionId: 't006_v2',
      version: '1.1.0',
      region: ['east', 'south'],
      storeIds: stores.filter(s => ['east', 'south'].includes(s.region)).map(s => s.id),
      storeNames: stores.filter(s => ['east', 'south'].includes(s.region)).map(s => s.name),
      status: 'active',
      deployType: 'immediate',
      scheduledAt: null,
      deployedAt: new Date(2026, 1, 10, 14, 0).toISOString(),
      withdrawnAt: null,
      deployedBy: 'u002',
      deployNote: ''
    },
    {
      id: 'dp004',
      templateId: 't008',
      templateName: '双眼皮手术知情同意书',
      versionId: 't008_v4',
      version: '1.3.0',
      region: ['north', 'east', 'south', 'west', 'central'],
      storeIds: stores.filter(s => s.isActive).map(s => s.id),
      storeNames: stores.filter(s => s.isActive).map(s => s.name),
      status: 'active',
      deployType: 'immediate',
      scheduledAt: null,
      deployedAt: new Date(2026, 3, 28, 11, 0).toISOString(),
      withdrawnAt: null,
      deployedBy: 'u002',
      deployNote: '重大版本更新，增加了未成年人手术监护人签字条款'
    },
    {
      id: 'dp005',
      templateId: 't009',
      templateName: '隆鼻手术知情同意书',
      versionId: 't009_v3',
      version: '1.2.0',
      region: ['north', 'east', 'south', 'west', 'central'],
      storeIds: stores.filter(s => s.isActive).map(s => s.id),
      storeNames: stores.filter(s => s.isActive).map(s => s.name),
      status: 'active',
      deployType: 'immediate',
      scheduledAt: null,
      deployedAt: new Date(2026, 5, 11, 9, 30).toISOString(),
      withdrawnAt: null,
      deployedBy: 'u002',
      deployNote: '新增排异风险提示后的最新全门店发布'
    },
    {
      id: 'dp006',
      templateId: 't001',
      templateName: '玻尿酸面部填充知情同意书',
      versionId: 't001_v2',
      version: '1.1.0',
      region: ['north', 'east', 'south', 'west', 'central'],
      storeIds: stores.filter(s => s.isActive).map(s => s.id),
      storeNames: stores.filter(s => s.isActive).map(s => s.name),
      status: 'scheduled',
      deployType: 'scheduled',
      scheduledAt: new Date(2026, 5, 25, 0, 0).toISOString(),
      deployedAt: new Date(2026, 5, 16, 15, 0).toISOString(),
      withdrawnAt: null,
      deployedBy: 'u002',
      deployNote: '血管栓塞风险重大更新，定于6月25日全门店上线'
    },
    {
      id: 'dp007',
      templateId: 't001',
      templateName: '玻尿酸面部填充知情同意书',
      versionId: 't001_v1',
      version: '1.0.0',
      region: ['north', 'east', 'south', 'west', 'central'],
      storeIds: stores.filter(s => s.isActive).map(s => s.id),
      storeNames: stores.filter(s => s.isActive).map(s => s.name),
      status: 'withdrawn',
      deployType: 'immediate',
      scheduledAt: null,
      deployedAt: new Date(2025, 11, 20, 10, 0).toISOString(),
      withdrawnAt: new Date(2026, 5, 16, 15, 0).toISOString(),
      deployedBy: 'u002',
      deployNote: '版本更新后自动撤下'
    },
    {
      id: 'dp008',
      templateId: 't004',
      templateName: '热玛吉抗衰知情同意书',
      versionId: 't004_v1',
      version: '1.0.0',
      region: ['west', 'central'],
      storeIds: stores.filter(s => ['west', 'central'].includes(s.region)).map(s => s.id),
      storeNames: stores.filter(s => ['west', 'central'].includes(s.region)).map(s => s.name),
      status: 'withdrawn',
      deployType: 'immediate',
      scheduledAt: null,
      deployedAt: new Date(2025, 7, 5, 14, 0).toISOString(),
      withdrawnAt: new Date(2026, 2, 28, 18, 0).toISOString(),
      deployedBy: 'u002',
      deployNote: '热玛吉项目在西区和中区下架'
    }
  ]
}

export const deployRecords: DeployRecord[] = generateDeploys()

const customerNames = [
  '刘婉婷', '陈思琪', '王梦瑶', '张雨欣', '李紫涵', '黄诗韵', '周佳怡', '吴雨桐',
  '徐若曦', '孙静怡', '朱雅琴', '马晓燕', '胡美玲', '郭慧敏', '林晓薇', '何丽娟',
  '高雪梅', '罗小芳', '梁晓红', '宋美玲', '谢雨欣', '唐雅莉', '韩梦琪', '冯思远',
  '董怡然', '程海蓝', '曹梓涵', '袁静姝', '邓雅婷', '许婉儿', '傅若琳', '沈心怡',
  '曾婉清', '彭雅洁', '吕梦婷', '苏嘉怡', '蒋亦菲', '蔡诗涵', '贾思彤', '丁佳宁',
  '魏子晴', '薛雅文', '叶梦瑶', '阎欣怡', '余思妍', '潘佳琪', '杜雨萱', '戴若彤',
  '夏语嫣', '钟思颖', '汪晓彤', '田佳慧', '任梓萱', '姜雅兰', '范思琪', '方雨婷',
  '石嘉欣', '姚若溪', '谭静怡', '廖梦雅'
]

function randomPhone(): string {
  return '1' + ['3', '5', '7', '8', '9'][Math.floor(Math.random() * 5)] +
    String(Math.floor(Math.random() * 900000000) + 100000000)
}

function randomIdCard(): string {
  const prefix = ['110101', '310101', '440101', '510104', '420102', '320102', '330102'][Math.floor(Math.random() * 7)]
  const year = 1985 + Math.floor(Math.random() * 25)
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')
  const suffix = String(Math.floor(Math.random() * 9000) + 1000)
  return `${prefix}${year}${month}${day}${suffix}`
}

const consultantNames = ['陈咨询', '刘咨询', '王咨询', '赵咨询', '孙咨询', '周咨询', '吴咨询', '郑咨询']

function generateSignatures(): SignatureRecord[] {
  const signatures: SignatureRecord[] = []
  const leafProjects = projects.filter(p => p.level === 3 && p.mappedTemplateVersions.length > 0)

  for (let i = 1; i <= 150; i++) {
    const project = leafProjects[i % leafProjects.length]
    const mapping = project.mappedTemplateVersions[0]
    const template = templates.find(t => t.id === mapping.templateId)!
    const store = stores[i % stores.length]
    const customerIdx = i % customerNames.length
    const age = 20 + Math.floor(Math.random() * 35)
    const isMinor = age < 18
    const isRetreatment = Math.random() < 0.15
    const isResigned = Math.random() < 0.08
    const paragraphs = template.versions.find(v => v.id === mapping.versionId)?.paragraphs || []

    const baseDate = new Date(2026, 5, 22)
    baseDate.setDate(baseDate.getDate() - (i % 60))
    baseDate.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0)

    const paragraphReadings: ParagraphReading[] = paragraphs.map(p => {
      const skipChance = p.isRiskHighlight ? 0.05 : 0.12
      const confirmAction = Math.random() > skipChance
      const baseDuration = p.isRiskHighlight ? 25 : 15
      const duration = confirmAction
        ? baseDuration + Math.floor(Math.random() * (p.isRiskHighlight ? 150 : 100))
        : 5 + Math.floor(Math.random() * 20)
      const scrollCount = Math.floor(Math.random() * 5)
      return {
        paragraphId: p.id,
        paragraphTitle: p.title,
        duration,
        scrollCount,
        confirmAction,
        confirmAt: confirmAction
          ? new Date(baseDate.getTime() + Math.floor(Math.random() * 600000)).toISOString()
          : null
      }
    })

    const totalReadingTime = paragraphReadings.reduce((sum, r) => sum + r.duration, 0)

    signatures.push({
      id: `sig${String(i).padStart(5, '0')}`,
      customerName: customerNames[customerIdx],
      customerPhone: randomPhone(),
      customerIdCard: randomIdCard(),
      age,
      isMinor,
      isRetreatment,
      projectId: project.id,
      projectName: project.name,
      templateId: template.id,
      templateName: template.name,
      templateCategory: template.category,
      templateVersionId: mapping.versionId,
      templateVersion: mapping.version,
      storeId: store.id,
      storeName: store.name,
      region: store.region,
      regionName: store.regionName,
      consultantId: `c${String(1 + (i % 8)).padStart(3, '0')}`,
      consultantName: consultantNames[i % consultantNames.length],
      status: isResigned ? 'resigned' : 'normal',
      totalReadingTime,
      paragraphReadings,
      signatureImage: `https://dummyimage.com/300x100/fff/000.png&text=${encodeURIComponent(customerNames[customerIdx] + '_签字')}`,
      signedAt: baseDate.toISOString()
    })
  }
  return signatures
}

export const signatureRecords: SignatureRecord[] = generateSignatures()

export function generateRiskTermStats(): RiskTermStats[] {
  const stats: RiskTermStats[] = []
  const allParagraphs: { paragraph: TemplateParagraph; template: Template }[] = []
  templates.forEach(t => {
    const latestVer = t.versions.find(v => v.isPublished) || t.versions[0]
    if (latestVer) {
      latestVer.paragraphs.forEach(p => {
        allParagraphs.push({ paragraph: p, template: t })
      })
    }
  })

  allParagraphs.forEach(({ paragraph, template }) => {
    const isRisk = paragraph.isRiskHighlight
    stats.push({
      paragraphId: paragraph.id,
      paragraphTitle: paragraph.title,
      templateId: template.id,
      templateName: template.name,
      templateCategory: template.category,
      avgDuration: isRisk ? 45 + Math.floor(Math.random() * 120) : 20 + Math.floor(Math.random() * 60),
      skipRate: isRisk ? 3 + Math.random() * 8 : 8 + Math.random() * 15,
      reviewCount: isRisk ? 15 + Math.floor(Math.random() * 40) : 3 + Math.floor(Math.random() * 15),
      signatureCount: 80 + Math.floor(Math.random() * 70)
    })
  })

  return stats.sort((a, b) => b.avgDuration - a.avgDuration)
}

export function generateReSignStats(): ReSignStats[] {
  const leafProjects = projects.filter(p => p.level === 3 && p.mappedTemplateVersions.length > 0)
  const stats: ReSignStats[] = []

  leafProjects.forEach(project => {
    const projectSigs = signatureRecords.filter(s => s.projectId === project.id)
    const resigned = projectSigs.filter(s => s.status === 'resigned').length
    const total = projectSigs.length || 1
    const template = templates.find(t => t.id === project.mappedTemplateVersions[0]?.templateId)
    stats.push({
      projectId: project.id,
      projectName: project.name,
      category: template?.category || 'injection',
      totalSignatures: total,
      resignedCount: resigned,
      resignRate: Number(((resigned / total) * 100).toFixed(2))
    })
  })

  return stats.sort((a, b) => b.resignRate - a.resignRate)
}

export function generateComplaintAssociations(): ComplaintAssociation[] {
  return [
    { id: 'ca001', projectId: 'prj024', projectName: '腰腹吸脂', templateId: 't010', templateVersionId: 't010_v2', paragraphId: 'p_plastic_3', paragraphTitle: '三、可能出现的风险与并发症', complaintCount: 3, associatedSignatures: 45 },
    { id: 'ca002', projectId: 'prj022', projectName: '硅胶隆鼻', templateId: 't009', templateVersionId: 't009_v3', paragraphId: 'p_plastic_3', paragraphTitle: '三、可能出现的风险与并发症', complaintCount: 2, associatedSignatures: 52 },
    { id: 'ca003', projectId: 'prj008', projectName: '乔雅登丰颜', templateId: 't001', templateVersionId: 't001_v2', paragraphId: 'p_injection_3', paragraphTitle: '三、可能出现的风险与并发症', complaintCount: 2, associatedSignatures: 78 },
    { id: 'ca004', projectId: 'prj028', projectName: '热玛吉四代', templateId: 't004', templateVersionId: 't004_v2', paragraphId: 'p_antiaging_6', paragraphTitle: '六、术后护理须知', complaintCount: 1, associatedSignatures: 36 },
    { id: 'ca005', projectId: 'prj016', projectName: '皮秒蜂巢', templateId: 't007', templateVersionId: 't007_v1', paragraphId: 'p_skin_6', paragraphTitle: '六、术后护理须知', complaintCount: 1, associatedSignatures: 28 }
  ]
}

export function generateAnalyticsSummary(): AnalyticsSummary {
  const monthlySignatures = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2025, 7 + i, 1)
    const label = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
    return {
      month: label,
      count: 80 + Math.floor(Math.random() * 60) - Math.abs(5 - i) * 5
    }
  })

  const resigned = signatureRecords.filter(s => s.status === 'resigned').length
  const avgTime = Math.round(signatureRecords.reduce((sum, s) => sum + s.totalReadingTime, 0) / signatureRecords.length)

  return {
    totalSignatures: signatureRecords.length,
    totalTemplates: templates.length,
    totalStores: stores.filter(s => s.isActive).length,
    pendingReviews: reviewRecords.filter(r => r.status === 'pending').length,
    resignRate: Number(((resigned / signatureRecords.length) * 100).toFixed(2)),
    avgReadingTime: avgTime,
    complaintCount: 9,
    monthlySignatures
  }
}

export const riskTermStats = generateRiskTermStats()
export const resignStats = generateReSignStats()
export const complaintAssociations = generateComplaintAssociations()
export const analyticsSummary = generateAnalyticsSummary()
