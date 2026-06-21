import { Router, type Request, type Response } from 'express'
import {
  templates,
  reviewRecords,
  type Template,
  type TemplateVersion,
  type TemplateParagraph,
  type TemplateCategory,
  type ApiResponse
} from '../data/mockData.js'

const router = Router()

function success<T>(data: T, message = '操作成功', total?: number, page?: number, pageSize?: number): ApiResponse<T> {
  return { success: true, data, message, total, page, pageSize }
}

function fail(message: string): ApiResponse<null> {
  return { success: false, data: null, message }
}

router.get('/', (req: Request, res: Response) => {
  const { category, status, keyword, page = '1', pageSize = '10' } = req.query
  let list = [...templates]

  if (category && category !== 'all') {
    list = list.filter(t => t.category === category)
  }
  if (status && status !== 'all') {
    list = list.filter(t => t.status === status)
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    list = list.filter(t =>
      t.name.toLowerCase().includes(kw) ||
      t.tags.some(tag => tag.toLowerCase().includes(kw))
    )
  }

  const total = list.length
  const pageNum = parseInt(String(page), 10)
  const pageSizeNum = parseInt(String(pageSize), 10)
  const start = (pageNum - 1) * pageSizeNum
  const paginated = list.slice(start, start + pageSizeNum)

  res.json(success(paginated, '获取模板列表成功', total, pageNum, pageSizeNum))
})

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const template = templates.find(t => t.id === id)
  if (!template) {
    res.status(404).json(fail('模板不存在'))
    return
  }
  res.json(success(template, '获取模板详情成功'))
})

router.post('/', (req: Request, res: Response) => {
  const { name, category, categoryName, tags } = req.body
  const newId = `t${String(templates.length + 1).padStart(3, '0')}`
  const now = new Date().toISOString()

  const newTemplate: Template = {
    id: newId,
    name: name || '新模板',
    category: (category as TemplateCategory) || 'injection',
    categoryName: categoryName || '注射美容',
    status: 'draft',
    tags: tags || [],
    currentVersionId: `${newId}_vdraft`,
    versions: [{
      id: `${newId}_vdraft`,
      version: '1.0.0',
      templateId: newId,
      paragraphs: [],
      changeLog: '',
      createdAt: now,
      createdBy: 'u001',
      isPublished: false
    }],
    createdAt: now,
    updatedAt: now,
    createdBy: 'u001',
    updatedBy: 'u001'
  }

  templates.push(newTemplate)
  res.json(success(newTemplate, '创建模板成功'))
})

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { name, category, categoryName, tags, status } = req.body
  const template = templates.find(t => t.id === id)

  if (!template) {
    res.status(404).json(fail('模板不存在'))
    return
  }

  if (name !== undefined) template.name = name
  if (category !== undefined) template.category = category
  if (categoryName !== undefined) template.categoryName = categoryName
  if (tags !== undefined) template.tags = tags
  if (status !== undefined) template.status = status
  template.updatedAt = new Date().toISOString()
  template.updatedBy = 'u001'

  res.json(success(template, '更新模板成功'))
})

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const idx = templates.findIndex(t => t.id === id)
  if (idx === -1) {
    res.status(404).json(fail('模板不存在'))
    return
  }
  templates.splice(idx, 1)
  res.json(success(null, '删除模板成功'))
})

router.get('/:id/versions', (req: Request, res: Response) => {
  const { id } = req.params
  const template = templates.find(t => t.id === id)
  if (!template) {
    res.status(404).json(fail('模板不存在'))
    return
  }
  res.json(success(template.versions, '获取版本列表成功'))
})

router.get('/:id/versions/:versionId', (req: Request, res: Response) => {
  const { id, versionId } = req.params
  const template = templates.find(t => t.id === id)
  if (!template) {
    res.status(404).json(fail('模板不存在'))
    return
  }
  const version = template.versions.find(v => v.id === versionId)
  if (!version) {
    res.status(404).json(fail('版本不存在'))
    return
  }
  res.json(success(version, '获取版本详情成功'))
})

router.post('/:id/versions', (req: Request, res: Response) => {
  const { id } = req.params
  const { changeLog, paragraphs } = req.body
  const template = templates.find(t => t.id === id)

  if (!template) {
    res.status(404).json(fail('模板不存在'))
    return
  }

  const currentVer = template.versions[template.versions.length - 1]
  const parts = currentVer.version.split('.').map(Number)
  parts[1] += 1
  const newVersionStr = parts.join('.')
  const now = new Date().toISOString()
  const newVersionId = `${id}_v${Date.now()}`

  const newVersion: TemplateVersion = {
    id: newVersionId,
    version: newVersionStr,
    templateId: id,
    paragraphs: paragraphs || currentVer.paragraphs,
    changeLog: changeLog || '',
    createdAt: now,
    createdBy: 'u001',
    isPublished: false
  }

  template.versions.push(newVersion)
  template.currentVersionId = newVersionId
  template.updatedAt = now

  res.json(success(newVersion, '创建新版本成功'))
})

router.put('/:id/versions/:versionId/paragraphs', (req: Request, res: Response) => {
  const { id, versionId } = req.params
  const { paragraphs } = req.body as { paragraphs: TemplateParagraph[] }
  const template = templates.find(t => t.id === id)

  if (!template) {
    res.status(404).json(fail('模板不存在'))
    return
  }
  const version = template.versions.find(v => v.id === versionId)
  if (!version) {
    res.status(404).json(fail('版本不存在'))
    return
  }

  version.paragraphs = paragraphs || version.paragraphs
  template.updatedAt = new Date().toISOString()

  res.json(success(version, '更新段落成功'))
})

router.post('/:id/versions/:versionId/submit-review', (req: Request, res: Response) => {
  const { id, versionId } = req.params
  const { changeSummary } = req.body
  const template = templates.find(t => t.id === id)

  if (!template) {
    res.status(404).json(fail('模板不存在'))
    return
  }
  const version = template.versions.find(v => v.id === versionId)
  if (!version) {
    res.status(404).json(fail('版本不存在'))
    return
  }

  template.status = 'pending'
  version.changeLog = changeSummary || version.changeLog
  const now = new Date().toISOString()

  const existing = reviewRecords.find(r => r.templateId === id && r.versionId === versionId && r.status === 'pending')
  let reviewRecord
  if (existing) {
    existing.submitTime = now
    existing.changeSummary = changeSummary || existing.changeSummary
    reviewRecord = existing
  } else {
    reviewRecord = {
      id: `rv${String(reviewRecords.length + 1).padStart(3, '0')}`,
      templateId: id,
      templateName: template.name,
      versionId,
      version: version.version,
      submitterId: 'u001',
      submitterName: '李晓明',
      submitTime: now,
      reviewerId: null,
      reviewerName: null,
      reviewTime: null,
      status: 'pending',
      decision: null,
      opinion: null,
      changeSummary: changeSummary || '提交审核'
    }
    reviewRecords.push(reviewRecord)
  }

  res.json(success(reviewRecord, '提交审核成功'))
})

export default router
