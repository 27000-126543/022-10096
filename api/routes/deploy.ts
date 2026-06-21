import { Router, type Request, type Response } from 'express'
import {
  stores,
  deployRecords,
  templates,
  type Region,
  type DeployStatus,
  type ApiResponse,
  type Store
} from '../data/mockData.js'

const router = Router()

function success<T>(data: T, message = '操作成功', total?: number, page?: number, pageSize?: number): ApiResponse<T> {
  return { success: true, data, message, total, page, pageSize }
}

function fail(message: string): ApiResponse<null> {
  return { success: false, data: null, message }
}

router.get('/stores', (req: Request, res: Response) => {
  const { region, city, keyword, isActive, page = '1', pageSize = '50' } = req.query
  let list = [...stores]

  if (region && region !== 'all') {
    list = list.filter(s => s.region === region)
  }
  if (city && city !== 'all') {
    list = list.filter(s => s.city === city)
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    list = list.filter(s =>
      s.name.toLowerCase().includes(kw) ||
      s.city.toLowerCase().includes(kw) ||
      s.manager.toLowerCase().includes(kw)
    )
  }
  if (isActive !== undefined && isActive !== 'all') {
    list = list.filter(s => s.isActive === (isActive === 'true'))
  }

  const regionMap = new Map<Region, Store[]>()
  list.forEach(s => {
    if (!regionMap.has(s.region)) regionMap.set(s.region, [])
    regionMap.get(s.region)!.push(s)
  })

  const citySet = new Set(list.map(s => s.city))
  const cities = Array.from(citySet).sort()

  const total = list.length
  const pageNum = parseInt(String(page), 10)
  const pageSizeNum = parseInt(String(pageSize), 10)
  const start = (pageNum - 1) * pageSizeNum
  const paginated = list.slice(start, start + pageSizeNum)

  res.json(success({
    list: paginated,
    regions: Array.from(regionMap.entries()).map(([region, storeList]) => ({
      region,
      regionName: storeList[0].regionName,
      count: storeList.length
    })),
    cities
  }, '获取门店列表成功', total, pageNum, pageSizeNum))
})

router.get('/stores/tree', (req: Request, res: Response) => {
  const regionGrouped = new Map<Region, Map<string, Store[]>>()

  stores.forEach(s => {
    if (!regionGrouped.has(s.region)) regionGrouped.set(s.region, new Map())
    const cityMap = regionGrouped.get(s.region)!
    if (!cityMap.has(s.city)) cityMap.set(s.city, [])
    cityMap.get(s.city)!.push(s)
  })

  const tree = Array.from(regionGrouped.entries()).map(([region, cityMap]) => {
    const firstStore = stores.find(s => s.region === region)!
    return {
      id: region,
      name: firstStore.regionName,
      type: 'region' as const,
      storeCount: stores.filter(s => s.region === region).length,
      children: Array.from(cityMap.entries()).map(([city, cityStores]) => ({
        id: `${region}_${city}`,
        name: city,
        type: 'city' as const,
        storeCount: cityStores.length,
        children: cityStores.map(s => ({
          id: s.id,
          name: s.name,
          type: 'store' as const,
          manager: s.manager,
          phone: s.phone,
          isActive: s.isActive
        }))
      }))
    }
  })

  res.json(success(tree, '获取门店树成功'))
})

router.get('/stores/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const store = stores.find(s => s.id === id)
  if (!store) {
    res.status(404).json(fail('门店不存在'))
    return
  }
  res.json(success(store, '获取门店详情成功'))
})

router.post('/stores', (req: Request, res: Response) => {
  const { name, region, city, address, phone, manager } = req.body
  const regionNameMap: Record<Region, string> = {
    north: '华北区', east: '华东区', south: '华南区', west: '西南区', central: '华中区'
  }
  const newId = `s${String(stores.length + 1).padStart(3, '0')}`

  const newStore: Store = {
    id: newId,
    name: name || '新门店',
    region: (region as Region) || 'north',
    regionName: regionNameMap[region as Region] || '华北区',
    city: city || '北京',
    address: address || '',
    phone: phone || '',
    manager: manager || '',
    isActive: true,
    createdAt: new Date().toISOString()
  }

  stores.push(newStore)
  res.json(success(newStore, '创建门店成功'))
})

router.get('/records', (req: Request, res: Response) => {
  const { status, templateId, region, page = '1', pageSize = '10' } = req.query
  let list = [...deployRecords]

  if (status && status !== 'all') {
    list = list.filter(r => r.status === status)
  }
  if (templateId && templateId !== 'all') {
    list = list.filter(r => r.templateId === templateId)
  }
  if (region && region !== 'all') {
    list = list.filter(r => r.region.includes(region as Region))
  }

  list.sort((a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime())

  const total = list.length
  const pageNum = parseInt(String(page), 10)
  const pageSizeNum = parseInt(String(pageSize), 10)
  const start = (pageNum - 1) * pageSizeNum
  const paginated = list.slice(start, start + pageSizeNum)

  res.json(success(paginated, '获取发布记录成功', total, pageNum, pageSizeNum))
})

router.get('/records/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const record = deployRecords.find(r => r.id === id)
  if (!record) {
    res.status(404).json(fail('发布记录不存在'))
    return
  }

  const template = templates.find(t => t.id === record.templateId)
  const version = template?.versions.find(v => v.id === record.versionId)
  const storeDetails = stores.filter(s => record.storeIds.includes(s.id))

  res.json(success({
    ...record,
    template,
    version,
    storeDetails
  }, '获取发布详情成功'))
})

router.post('/records', (req: Request, res: Response) => {
  const {
    templateId,
    versionId,
    region,
    storeIds,
    deployType = 'immediate',
    scheduledAt = null,
    deployNote = ''
  } = req.body

  const template = templates.find(t => t.id === templateId)
  if (!template) {
    res.status(404).json(fail('模板不存在'))
    return
  }
  const version = template.versions.find(v => v.id === versionId)
  if (!version) {
    res.status(404).json(fail('模板版本不存在'))
    return
  }

  const storeList = stores.filter(s => storeIds.includes(s.id))
  const newId = `dp${String(deployRecords.length + 1).padStart(3, '0')}`
  const now = new Date().toISOString()

  const status: DeployStatus = deployType === 'scheduled' ? 'scheduled' : 'active'

  const newRecord = {
    id: newId,
    templateId,
    templateName: template.name,
    versionId,
    version: version.version,
    region: region as Region[],
    storeIds,
    storeNames: storeList.map(s => s.name),
    status,
    deployType,
    scheduledAt,
    deployedAt: now,
    withdrawnAt: null,
    deployedBy: 'u002',
    deployNote
  }

  deployRecords.push(newRecord)

  if (status === 'active') {
    deployRecords.forEach(r => {
      if (r.templateId === templateId && r.status === 'active' && r.id !== newId) {
        r.status = 'withdrawn'
        r.withdrawnAt = now
      }
    })
  }

  if (status === 'active') {
    template.status = 'published'
    version.isPublished = true
  }

  res.json(success(newRecord, '发布成功'))
})

router.post('/records/:id/withdraw', (req: Request, res: Response) => {
  const { id } = req.params
  const { reason } = req.body
  const record = deployRecords.find(r => r.id === id)

  if (!record) {
    res.status(404).json(fail('发布记录不存在'))
    return
  }
  if (record.status === 'withdrawn') {
    res.status(400).json(fail('该记录已撤下'))
    return
  }

  const now = new Date().toISOString()
  record.status = 'withdrawn'
  record.withdrawnAt = now
  if (reason) record.deployNote = `${record.deployNote ? record.deployNote + '；' : ''}撤下原因：${reason}`

  res.json(success(record, '撤下成功'))
})

router.post('/records/:id/activate', (req: Request, res: Response) => {
  const { id } = req.params
  const record = deployRecords.find(r => r.id === id)

  if (!record) {
    res.status(404).json(fail('发布记录不存在'))
    return
  }
  if (record.status !== 'scheduled') {
    res.status(400).json(fail('仅定时发布记录可立即激活'))
    return
  }

  record.status = 'active'
  record.scheduledAt = null
  record.deployedAt = new Date().toISOString()

  res.json(success(record, '立即发布成功'))
})

router.get('/store/:storeId/active-templates', (req: Request, res: Response) => {
  const { storeId } = req.params
  const store = stores.find(s => s.id === storeId)
  if (!store) {
    res.status(404).json(fail('门店不存在'))
    return
  }

  const activeDeploys = deployRecords.filter(r =>
    r.status === 'active' && r.storeIds.includes(storeId)
  )

  const templatesInfo = activeDeploys.map(r => {
    const template = templates.find(t => t.id === r.templateId)
    const version = template?.versions.find(v => v.id === r.versionId)
    return {
      deployRecordId: r.id,
      templateId: r.templateId,
      templateName: r.templateName,
      versionId: r.versionId,
      version: r.version,
      category: template?.category,
      categoryName: template?.categoryName,
      deployedAt: r.deployedAt,
      paragraphs: version?.paragraphs
    }
  })

  res.json(success(templatesInfo, '获取门店已发布模板成功'))
})

export default router
