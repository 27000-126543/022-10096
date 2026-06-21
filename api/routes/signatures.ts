import { Router, type Request, type Response } from 'express'
import {
  signatureRecords,
  templates,
  type TemplateCategory,
  type Region,
  type SignatureStatus,
  type ApiResponse,
  type SignatureRecord
} from '../data/mockData.js'

const router = Router()

function success<T>(data: T, message = '操作成功', total?: number, page?: number, pageSize?: number): ApiResponse<T> {
  return { success: true, data, message, total, page, pageSize }
}

function fail(message: string): ApiResponse<null> {
  return { success: false, data: null, message }
}

router.get('/', (req: Request, res: Response) => {
  const {
    category,
    region,
    storeId,
    projectId,
    templateId,
    status,
    isMinor,
    isRetreatment,
    keyword,
    startDate,
    endDate,
    minDuration,
    maxDuration,
    page = '1',
    pageSize = '20'
  } = req.query

  let list = [...signatureRecords] as SignatureRecord[]

  if (category && category !== 'all') {
    list = list.filter(s => s.templateCategory === category)
  }
  if (region && region !== 'all') {
    list = list.filter(s => s.region === region)
  }
  if (storeId && storeId !== 'all') {
    list = list.filter(s => s.storeId === storeId)
  }
  if (projectId && projectId !== 'all') {
    list = list.filter(s => s.projectId === projectId)
  }
  if (templateId && templateId !== 'all') {
    list = list.filter(s => s.templateId === templateId)
  }
  if (status && status !== 'all') {
    list = list.filter(s => s.status === status)
  }
  if (isMinor !== undefined && isMinor !== 'all') {
    list = list.filter(s => s.isMinor === (isMinor === 'true'))
  }
  if (isRetreatment !== undefined && isRetreatment !== 'all') {
    list = list.filter(s => s.isRetreatment === (isRetreatment === 'true'))
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    list = list.filter(s =>
      s.customerName.toLowerCase().includes(kw) ||
      s.customerPhone.includes(kw) ||
      s.projectName.toLowerCase().includes(kw) ||
      s.storeName.toLowerCase().includes(kw)
    )
  }
  if (startDate) {
    const start = new Date(String(startDate)).getTime()
    list = list.filter(s => new Date(s.signedAt).getTime() >= start)
  }
  if (endDate) {
    const end = new Date(String(endDate)).getTime() + 86400000
    list = list.filter(s => new Date(s.signedAt).getTime() < end)
  }
  if (minDuration) {
    list = list.filter(s => s.totalReadingTime >= Number(minDuration))
  }
  if (maxDuration) {
    list = list.filter(s => s.totalReadingTime <= Number(maxDuration))
  }

  list.sort((a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime())

  const total = list.length
  const pageNum = parseInt(String(page), 10)
  const pageSizeNum = parseInt(String(pageSize), 10)
  const start = (pageNum - 1) * pageSizeNum
  const paginated = list.slice(start, start + pageSizeNum).map(s => ({
    id: s.id,
    customerName: s.customerName,
    customerPhone: s.customerPhone,
    age: s.age,
    isMinor: s.isMinor,
    isRetreatment: s.isRetreatment,
    projectId: s.projectId,
    projectName: s.projectName,
    templateId: s.templateId,
    templateName: s.templateName,
    templateCategory: s.templateCategory,
    templateVersionId: s.templateVersionId,
    templateVersion: s.templateVersion,
    storeId: s.storeId,
    storeName: s.storeName,
    region: s.region,
    regionName: s.regionName,
    consultantName: s.consultantName,
    status: s.status,
    totalReadingTime: s.totalReadingTime,
    signedAt: s.signedAt
  }))

  res.json(success(paginated, '获取签署列表成功', total, pageNum, pageSizeNum))
})

router.get('/stats/summary', (req: Request, res: Response) => {
  const total = signatureRecords.length
  const resigned = signatureRecords.filter(s => s.status === 'resigned').length
  const normal = total - resigned
  const avgTime = Math.round(
    signatureRecords.reduce((sum, s) => sum + s.totalReadingTime, 0) / total
  )
  const minTime = Math.min(...signatureRecords.map(s => s.totalReadingTime))
  const maxTime = Math.max(...signatureRecords.map(s => s.totalReadingTime))

  const categoryStats: Array<{
    category: TemplateCategory
    categoryName: string
    count: number
    avgTime: number
    resignedCount: number
  }> = []

  const categories: TemplateCategory[] = ['injection', 'skin', 'plastic', 'antiaging']
  const categoryNames: Record<TemplateCategory, string> = {
    injection: '注射美容', skin: '皮肤美容', plastic: '整形外科', antiaging: '抗衰管理'
  }
  categories.forEach(cat => {
    const catSigs = signatureRecords.filter(s => s.templateCategory === cat)
    if (catSigs.length > 0) {
      categoryStats.push({
        category: cat,
        categoryName: categoryNames[cat],
        count: catSigs.length,
        avgTime: Math.round(catSigs.reduce((sum, s) => sum + s.totalReadingTime, 0) / catSigs.length),
        resignedCount: catSigs.filter(s => s.status === 'resigned').length
      })
    }
  })

  const regionStats: Array<{
    region: Region
    regionName: string
    count: number
    avgTime: number
  }> = []

  const regions: Region[] = ['north', 'east', 'south', 'west', 'central']
  const regionNames: Record<Region, string> = {
    north: '华北区', east: '华东区', south: '华南区', west: '西南区', central: '华中区'
  }
  regions.forEach(reg => {
    const regSigs = signatureRecords.filter(s => s.region === reg)
    if (regSigs.length > 0) {
      regionStats.push({
        region: reg,
        regionName: regionNames[reg],
        count: regSigs.length,
        avgTime: Math.round(regSigs.reduce((sum, s) => sum + s.totalReadingTime, 0) / regSigs.length)
      })
    }
  })

  const stats = {
    total,
    normal,
    resigned,
    resignRate: Number(((resigned / total) * 100).toFixed(2)),
    avgReadingTime: avgTime,
    minReadingTime: minTime,
    maxReadingTime: maxTime,
    categoryStats,
    regionStats
  }

  res.json(success(stats, '获取签署统计成功'))
})

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const signature = signatureRecords.find(s => s.id === id)
  if (!signature) {
    res.status(404).json(fail('签署记录不存在'))
    return
  }

  const template = templates.find(t => t.id === signature.templateId)
  const version = template?.versions.find(v => v.id === signature.templateVersionId)

  const timeline = signature.paragraphReadings.map((r, idx) => ({
    type: r.confirmAction ? 'confirm' : (idx === 0 ? 'start' : 'read'),
    title: r.paragraphTitle,
    duration: r.duration,
    action: r.confirmAction,
    actionAt: r.confirmAt,
    scrollCount: r.scrollCount
  }))
  timeline.push({
    type: 'sign',
    title: '签字确认完成',
    duration: 0,
    action: true,
    actionAt: signature.signedAt,
    scrollCount: 0
  })

  const detail = {
    ...signature,
    templateSnapshot: {
      name: template?.name,
      category: template?.category,
      categoryName: template?.categoryName,
      version: signature.templateVersion,
      paragraphs: version?.paragraphs.map(p => ({
        id: p.id,
        title: p.title,
        type: p.type,
        content: p.content,
        isRiskHighlight: p.isRiskHighlight
      }))
    },
    timeline
  }

  res.json(success(detail, '获取签署详情成功'))
})

router.get('/customer/:customerPhone', (req: Request, res: Response) => {
  const { customerPhone } = req.params
  const list = signatureRecords
    .filter(s => s.customerPhone === customerPhone)
    .sort((a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime())

  res.json(success(list, '获取顾客签署历史成功', list.length))
})

router.get('/store/:storeId/records', (req: Request, res: Response) => {
  const { storeId } = req.params
  const { startDate, endDate, page = '1', pageSize = '50' } = req.query
  let list = signatureRecords.filter(s => s.storeId === storeId)

  if (startDate) {
    const start = new Date(String(startDate)).getTime()
    list = list.filter(s => new Date(s.signedAt).getTime() >= start)
  }
  if (endDate) {
    const end = new Date(String(endDate)).getTime() + 86400000
    list = list.filter(s => new Date(s.signedAt).getTime() < end)
  }

  list.sort((a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime())

  const total = list.length
  const pageNum = parseInt(String(page), 10)
  const pageSizeNum = parseInt(String(pageSize), 10)
  const start = (pageNum - 1) * pageSizeNum
  const paginated = list.slice(start, start + pageSizeNum)

  res.json(success(paginated, '获取门店签署记录成功', total, pageNum, pageSizeNum))
})

router.get('/export/data', (req: Request, res: Response) => {
  const {
    category, region, storeId, status, startDate, endDate, format = 'json'
  } = req.query

  let list = [...signatureRecords]

  if (category && category !== 'all') {
    list = list.filter(s => s.templateCategory === category)
  }
  if (region && region !== 'all') {
    list = list.filter(s => s.region === region)
  }
  if (storeId && storeId !== 'all') {
    list = list.filter(s => s.storeId === storeId)
  }
  if (status && status !== 'all') {
    list = list.filter(s => s.status === status)
  }
  if (startDate) {
    const start = new Date(String(startDate)).getTime()
    list = list.filter(s => new Date(s.signedAt).getTime() >= start)
  }
  if (endDate) {
    const end = new Date(String(endDate)).getTime() + 86400000
    list = list.filter(s => new Date(s.signedAt).getTime() < end)
  }

  if (format === 'csv') {
    const headers = [
      '签署编号', '顾客姓名', '手机号', '身份证号', '年龄', '是否未成年',
      '是否二次治疗', '项目名称', '模板名称', '模板版本', '门店名称',
      '区域', '咨询顾问', '签署状态', '阅读总时长(秒)', '签署时间'
    ]
    const rows = list.map(s => [
      s.id, s.customerName, s.customerPhone, s.customerIdCard, s.age,
      s.isMinor ? '是' : '否', s.isRetreatment ? '是' : '否',
      s.projectName, s.templateName, s.templateVersion, s.storeName,
      s.regionName, s.consultantName,
      s.status === 'normal' ? '正常' : '补签',
      s.totalReadingTime, s.signedAt
    ])
    const csv = [headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="signatures_${Date.now()}.csv"`)
    res.send('\uFEFF' + csv)
    return
  }

  const exportData = list.map(s => ({
    id: s.id,
    customerName: s.customerName,
    customerPhone: s.customerPhone,
    customerIdCard: s.customerIdCard,
    age: s.age,
    isMinor: s.isMinor,
    isRetreatment: s.isRetreatment,
    projectId: s.projectId,
    projectName: s.projectName,
    templateId: s.templateId,
    templateName: s.templateName,
    templateCategory: s.templateCategory,
    templateVersion: s.templateVersion,
    storeId: s.storeId,
    storeName: s.storeName,
    regionName: s.regionName,
    consultantName: s.consultantName,
    status: s.status,
    totalReadingTime: s.totalReadingTime,
    paragraphReadings: s.paragraphReadings,
    signedAt: s.signedAt
  }))

  res.json(success({
    count: exportData.length,
    exportAt: new Date().toISOString(),
    data: exportData
  }, '导出数据成功'))
})

router.get('/:id/archive', (req: Request, res: Response) => {
  const { id } = req.params
  const signature = signatureRecords.find(s => s.id === id)
  if (!signature) {
    res.status(404).json(fail('签署档案不存在'))
    return
  }

  const template = templates.find(t => t.id === signature.templateId)
  const version = template?.versions.find(v => v.id === signature.templateVersionId)

  const archive = {
    archiveNo: `ARCH-${signature.id}-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    customerInfo: {
      name: signature.customerName,
      phone: signature.customerPhone,
      idCard: signature.customerIdCard,
      age: signature.age,
      isMinor: signature.isMinor,
      isRetreatment: signature.isRetreatment
    },
    projectInfo: {
      projectId: signature.projectId,
      projectName: signature.projectName
    },
    storeInfo: {
      storeId: signature.storeId,
      storeName: signature.storeName,
      region: signature.regionName,
      consultant: signature.consultantName
    },
    templateInfo: {
      templateId: signature.templateId,
      templateName: signature.templateName,
      category: signature.templateCategory,
      versionId: signature.templateVersionId,
      version: signature.templateVersion,
      paragraphs: version?.paragraphs
    },
    signingProcess: {
      totalReadingTime: signature.totalReadingTime,
      paragraphReadings: signature.paragraphReadings,
      signedAt: signature.signedAt,
      signatureImage: signature.signatureImage,
      status: signature.status
    }
  }

  res.json(success(archive, '获取签署档案成功'))
})

export default router
