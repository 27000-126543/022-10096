import { Router, type Request, type Response } from 'express'
import {
  reviewRecords,
  templates,
  type ReviewDecision,
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
  const { status, templateId, submitterId, page = '1', pageSize = '10' } = req.query
  let list = [...reviewRecords]

  if (status && status !== 'all') {
    list = list.filter(r => r.status === status)
  }
  if (templateId) {
    list = list.filter(r => r.templateId === templateId)
  }
  if (submitterId) {
    list = list.filter(r => r.submitterId === submitterId)
  }

  list.sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())

  const total = list.length
  const pageNum = parseInt(String(page), 10)
  const pageSizeNum = parseInt(String(pageSize), 10)
  const start = (pageNum - 1) * pageSizeNum
  const paginated = list.slice(start, start + pageSizeNum)

  res.json(success(paginated, '获取审核列表成功', total, pageNum, pageSizeNum))
})

router.get('/stats', (req: Request, res: Response) => {
  const stats = {
    total: reviewRecords.length,
    pending: reviewRecords.filter(r => r.status === 'pending').length,
    approved: reviewRecords.filter(r => r.status === 'approved').length,
    rejected: reviewRecords.filter(r => r.status === 'rejected').length
  }
  res.json(success(stats, '获取审核统计成功'))
})

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const record = reviewRecords.find(r => r.id === id)
  if (!record) {
    res.status(404).json(fail('审核记录不存在'))
    return
  }

  const template = templates.find(t => t.id === record.templateId)
  const currentVersion = template?.versions.find(v => v.id === record.versionId)
  const prevVersion = template?.versions.find((v, idx, arr) => {
    const currIdx = arr.findIndex(x => x.id === record.versionId)
    return currIdx > 0 && idx === currIdx - 1
  })

  const detail = {
    ...record,
    template,
    currentVersion,
    prevVersion
  }

  res.json(success(detail, '获取审核详情成功'))
})

router.post('/:id/decision', (req: Request, res: Response) => {
  const { id } = req.params
  const { decision, opinion } = req.body as { decision: ReviewDecision; opinion?: string }
  const record = reviewRecords.find(r => r.id === id)

  if (!record) {
    res.status(404).json(fail('审核记录不存在'))
    return
  }

  if (record.status !== 'pending') {
    res.status(400).json(fail('该记录已处理，不可重复审核'))
    return
  }

  const now = new Date().toISOString()
  record.reviewerId = 'u002'
  record.reviewerName = '王建国'
  record.reviewTime = now
  record.status = decision
  record.decision = decision
  record.opinion = opinion || (decision === 'approved' ? '审核通过' : '驳回')

  const template = templates.find(t => t.id === record.templateId)
  if (template) {
    if (decision === 'approved') {
      template.status = 'approved'
      const version = template.versions.find(v => v.id === record.versionId)
      if (version) {
        version.isPublished = false
      }
    } else {
      template.status = 'rejected'
    }
    template.updatedAt = now
  }

  res.json(success(record, decision === 'approved' ? '审核通过成功' : '审核驳回成功'))
})

router.get('/:id/compare', (req: Request, res: Response) => {
  const { id } = req.params
  const record = reviewRecords.find(r => r.id === id)

  if (!record) {
    res.status(404).json(fail('审核记录不存在'))
    return
  }

  const template = templates.find(t => t.id === record.templateId)
  if (!template) {
    res.status(404).json(fail('模板不存在'))
    return
  }

  const versionIdx = template.versions.findIndex(v => v.id === record.versionId)
  const currentVersion = template.versions[versionIdx]
  const prevVersion = versionIdx > 0 ? template.versions[versionIdx - 1] : null

  const diffParagraphs = currentVersion?.paragraphs.map((curr, idx) => {
    const prev = prevVersion?.paragraphs[idx]
    const hasChange = !prev || prev.content !== curr.content || prev.title !== curr.title
    let changeType: 'added' | 'modified' | 'unchanged' = 'unchanged'
    if (!prev) changeType = 'added'
    else if (hasChange) changeType = 'modified'

    return {
      current: curr,
      previous: prev || null,
      hasChange,
      changeType
    }
  }) || []

  res.json(success({
    template,
    currentVersion,
    prevVersion,
    diffParagraphs
  }, '获取版本对比成功'))
})

router.get('/template/:templateId/history', (req: Request, res: Response) => {
  const { templateId } = req.params
  const list = reviewRecords
    .filter(r => r.templateId === templateId)
    .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())

  res.json(success(list, '获取模板审核历史成功', list.length))
})

export default router
