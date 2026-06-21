import { Router, type Request, type Response } from 'express'
import {
  analyticsSummary,
  riskTermStats,
  resignStats,
  complaintAssociations,
  signatureRecords,
  templates,
  stores,
  reviewRecords,
  deployRecords,
  type TemplateCategory,
  type Region,
  type ApiResponse
} from '../data/mockData.js'

const router = Router()

function success<T>(data: T, message = '操作成功', total?: number, page?: number, pageSize?: number): ApiResponse<T> {
  return { success: true, data, message, total, page, pageSize }
}

function fail(message: string): ApiResponse<null> {
  return { success: false, data: null, message }
}

router.get('/summary', (req: Request, res: Response) => {
  const { timeRange = '30d' } = req.query

  const todaySigs = signatureRecords.filter(s => {
    const d = new Date(s.signedAt)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  }).length

  const yesterdaySigs = signatureRecords.filter(s => {
    const d = new Date(s.signedAt)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return d.toDateString() === yesterday.toDateString()
  }).length

  const weekSigs = signatureRecords.filter(s => {
    const d = new Date(s.signedAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return d >= weekAgo
  }).length

  const totalComplaints = complaintAssociations.reduce((sum, c) => sum + c.complaintCount, 0)
  const activeTemplates = templates.filter(t => t.status === 'published').length
  const activeStores = stores.filter(s => s.isActive).length

  const summary = {
    ...analyticsSummary,
    todaySignatures: todaySigs,
    yesterdaySignatures: yesterdaySigs,
    weekSignatures: weekSigs,
    totalComplaints,
    activeTemplates,
    activeStores,
    pendingDeployCount: deployRecords.filter(d => d.status === 'scheduled').length,
    activeDeployCount: deployRecords.filter(d => d.status === 'active').length
  }

  res.json(success(summary, '获取统计汇总成功'))
})

router.get('/kpi-cards', (req: Request, res: Response) => {
  const total = signatureRecords.length
  const resigned = signatureRecords.filter(s => s.status === 'resigned').length
  const avgTime = Math.round(
    signatureRecords.reduce((sum, s) => sum + s.totalReadingTime, 0) / total
  )

  const today = new Date()
  const last30Days = new Date(today.getTime() - 30 * 86400000)
  const sigs30d = signatureRecords.filter(s => new Date(s.signedAt) >= last30Days)
  const resign30d = sigs30d.filter(s => s.status === 'resigned').length

  const cards = [
    {
      id: 'total_sigs',
      title: '签署总数',
      value: total,
      unit: '份',
      trend: 12.5,
      trendType: 'up' as const,
      description: '较上月'
    },
    {
      id: 'resign_rate',
      title: '补签率',
      value: Number(((resigned / total) * 100).toFixed(2)),
      unit: '%',
      trend: -2.3,
      trendType: 'down' as const,
      description: '较上月'
    },
    {
      id: 'avg_reading',
      title: '平均阅读时长',
      value: avgTime,
      unit: '秒',
      trend: 8.1,
      trendType: 'up' as const,
      description: '较上月'
    },
    {
      id: 'complaint_count',
      title: '客诉关联数',
      value: complaintAssociations.reduce((s, c) => s + c.complaintCount, 0),
      unit: '起',
      trend: 0,
      trendType: 'flat' as const,
      description: '本月'
    },
    {
      id: 'pending_reviews',
      title: '待审核',
      value: reviewRecords.filter(r => r.status === 'pending').length,
      unit: '份',
      trend: 1,
      trendType: 'up' as const,
      description: '较昨日'
    },
    {
      id: 'resign_30d',
      title: '30天补签率',
      value: sigs30d.length > 0 ? Number(((resign30d / sigs30d.length) * 100).toFixed(2)) : 0,
      unit: '%',
      trend: -1.5,
      trendType: 'down' as const,
      description: '环比'
    }
  ]

  res.json(success(cards, '获取KPI卡片成功'))
})

router.get('/risk-terms', (req: Request, res: Response) => {
  const { category, templateId, top = '20', sortBy = 'avgDuration', page = '1', pageSize = '50' } = req.query
  let list = [...riskTermStats]

  if (category && category !== 'all') {
    list = list.filter(r => r.templateCategory === category)
  }
  if (templateId && templateId !== 'all') {
    list = list.filter(r => r.templateId === templateId)
  }

  const sortKey = String(sortBy)
  list.sort((a: any, b: any) => {
    if (sortKey === 'skipRate') return b.skipRate - a.skipRate
    if (sortKey === 'reviewCount') return b.reviewCount - a.reviewCount
    return b.avgDuration - a.avgDuration
  })

  const topN = parseInt(String(top), 10)
  if (topN > 0 && topN < list.length) {
    list = list.slice(0, topN)
  }

  const total = list.length
  const pageNum = parseInt(String(page), 10)
  const pageSizeNum = parseInt(String(pageSize), 10)
  const start = (pageNum - 1) * pageSizeNum
  const paginated = list.slice(start, start + pageSizeNum)

  res.json(success(paginated, '获取风险条款统计成功', total, pageNum, pageSizeNum))
})

router.get('/resign-rate', (req: Request, res: Response) => {
  const { category, top = '20', sortBy = 'resignRate' } = req.query
  let list = [...resignStats]

  if (category && category !== 'all') {
    list = list.filter(r => r.category === category)
  }

  const sortKey = String(sortBy)
  list.sort((a: any, b: any) => b[sortKey] - a[sortKey])

  const topN = parseInt(String(top), 10)
  if (topN > 0 && topN < list.length) {
    list = list.slice(0, topN)
  }

  const categories: TemplateCategory[] = ['injection', 'skin', 'plastic', 'antiaging']
  const categoryNames: Record<TemplateCategory, string> = {
    injection: '注射美容', skin: '皮肤美容', plastic: '整形外科', antiaging: '抗衰管理'
  }
  const byCategory = categories.map(cat => {
    const catStats = list.filter(r => r.category === cat)
    const totalSigs = catStats.reduce((s, r) => s + r.totalSignatures, 0)
    const totalResigned = catStats.reduce((s, r) => s + r.resignedCount, 0)
    return {
      category: cat,
      categoryName: categoryNames[cat],
      totalSignatures: totalSigs,
      resignedCount: totalResigned,
      resignRate: totalSigs > 0 ? Number(((totalResigned / totalSigs) * 100).toFixed(2)) : 0
    }
  })

  res.json(success({
    byProject: list,
    byCategory
  }, '获取补签率统计成功'))
})

router.get('/resign-trend', (req: Request, res: Response) => {
  const days = 30
  const today = new Date()
  const trend = Array.from({ length: days }, (_, i) => {
    const date = new Date(today.getTime() - (days - 1 - i) * 86400000)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
    const daySigs = signatureRecords.filter(s => {
      const sd = new Date(s.signedAt)
      return sd.toDateString() === date.toDateString()
    })
    const dayResigned = daySigs.filter(s => s.status === 'resigned').length
    return {
      date: dateStr,
      totalSignatures: daySigs.length || Math.floor(3 + Math.random() * 8),
      resignedCount: dayResigned || (daySigs.length > 0 ? Math.floor(Math.random() * 2) : 0),
      resignRate: daySigs.length > 0
        ? Number(((dayResigned / daySigs.length) * 100).toFixed(2))
        : (Math.random() * 10 + 2)
    }
  })

  res.json(success(trend, '获取补签趋势成功'))
})

router.get('/complaint-associations', (req: Request, res: Response) => {
  const { category, page = '1', pageSize = '20' } = req.query
  let list = [...complaintAssociations]

  if (category && category !== 'all') {
    const catProjects = new Set(
      resignStats.filter(r => r.category === category).map(r => r.projectId)
    )
    list = list.filter(c => catProjects.has(c.projectId))
  }

  list.sort((a, b) => b.complaintCount - a.complaintCount)

  const total = list.length
  const pageNum = parseInt(String(page), 10)
  const pageSizeNum = parseInt(String(pageSize), 10)
  const start = (pageNum - 1) * pageSizeNum
  const paginated = list.slice(start, start + pageSizeNum)

  res.json(success(paginated, '获取客诉关联分析成功', total, pageNum, pageSizeNum))
})

router.get('/dimension/:dimension', (req: Request, res: Response) => {
  const { dimension } = req.params
  const { startDate, endDate } = req.query

  let filteredSigs = [...signatureRecords]
  if (startDate) {
    const start = new Date(String(startDate)).getTime()
    filteredSigs = filteredSigs.filter(s => new Date(s.signedAt).getTime() >= start)
  }
  if (endDate) {
    const end = new Date(String(endDate)).getTime() + 86400000
    filteredSigs = filteredSigs.filter(s => new Date(s.signedAt).getTime() < end)
  }

  let result: any[] = []

  if (dimension === 'category') {
    const categories: TemplateCategory[] = ['injection', 'skin', 'plastic', 'antiaging']
    const categoryNames: Record<TemplateCategory, string> = {
      injection: '注射美容', skin: '皮肤美容', plastic: '整形外科', antiaging: '抗衰管理'
    }
    result = categories.map(cat => {
      const catSigs = filteredSigs.filter(s => s.templateCategory === cat)
      const resigned = catSigs.filter(s => s.status === 'resigned').length
      return {
        id: cat,
        name: categoryNames[cat],
        category: cat,
        totalSignatures: catSigs.length,
        resignedCount: resigned,
        resignRate: catSigs.length > 0 ? Number(((resigned / catSigs.length) * 100).toFixed(2)) : 0,
        avgReadingTime: catSigs.length > 0
          ? Math.round(catSigs.reduce((sum, s) => sum + s.totalReadingTime, 0) / catSigs.length)
          : 0
      }
    })
  } else if (dimension === 'region') {
    const regions: Region[] = ['north', 'east', 'south', 'west', 'central']
    const regionNames: Record<Region, string> = {
      north: '华北区', east: '华东区', south: '华南区', west: '西南区', central: '华中区'
    }
    result = regions.map(reg => {
      const regSigs = filteredSigs.filter(s => s.region === reg)
      const resigned = regSigs.filter(s => s.status === 'resigned').length
      const storeCount = stores.filter(st => st.region === reg && st.isActive).length
      return {
        id: reg,
        name: regionNames[reg],
        region: reg,
        storeCount,
        totalSignatures: regSigs.length,
        resignedCount: resigned,
        resignRate: regSigs.length > 0 ? Number(((resigned / regSigs.length) * 100).toFixed(2)) : 0,
        avgReadingTime: regSigs.length > 0
          ? Math.round(regSigs.reduce((sum, s) => sum + s.totalReadingTime, 0) / regSigs.length)
          : 0
      }
    })
  } else if (dimension === 'store') {
    const storeMap = new Map<string, typeof filteredSigs>()
    filteredSigs.forEach(s => {
      if (!storeMap.has(s.storeId)) storeMap.set(s.storeId, [])
      storeMap.get(s.storeId)!.push(s)
    })
    result = stores.filter(s => s.isActive).map(store => {
      const storeSigs = storeMap.get(store.id) || []
      const resigned = storeSigs.filter(s => s.status === 'resigned').length
      return {
        id: store.id,
        name: store.name,
        region: store.region,
        regionName: store.regionName,
        city: store.city,
        totalSignatures: storeSigs.length,
        resignedCount: resigned,
        resignRate: storeSigs.length > 0 ? Number(((resigned / storeSigs.length) * 100).toFixed(2)) : 0,
        avgReadingTime: storeSigs.length > 0
          ? Math.round(storeSigs.reduce((sum, s) => sum + s.totalReadingTime, 0) / storeSigs.length)
          : 0
      }
    }).sort((a, b) => b.totalSignatures - a.totalSignatures)
  } else if (dimension === 'template') {
    const tplMap = new Map<string, typeof filteredSigs>()
    filteredSigs.forEach(s => {
      if (!tplMap.has(s.templateId)) tplMap.set(s.templateId, [])
      tplMap.get(s.templateId)!.push(s)
    })
    result = templates.map(tpl => {
      const tplSigs = tplMap.get(tpl.id) || []
      const resigned = tplSigs.filter(s => s.status === 'resigned').length
      return {
        id: tpl.id,
        name: tpl.name,
        category: tpl.category,
        categoryName: tpl.categoryName,
        status: tpl.status,
        totalSignatures: tplSigs.length,
        resignedCount: resigned,
        resignRate: tplSigs.length > 0 ? Number(((resigned / tplSigs.length) * 100).toFixed(2)) : 0,
        avgReadingTime: tplSigs.length > 0
          ? Math.round(tplSigs.reduce((sum, s) => sum + s.totalReadingTime, 0) / tplSigs.length)
          : 0
      }
    }).sort((a, b) => b.totalSignatures - a.totalSignatures)
  } else if (dimension === 'age') {
    const ageGroups = [
      { key: 'under25', label: '25岁以下', min: 0, max: 25 },
      { key: '25_35', label: '25-35岁', min: 25, max: 35 },
      { key: '35_45', label: '35-45岁', min: 35, max: 45 },
      { key: 'over45', label: '45岁以上', min: 45, max: 200 }
    ]
    result = ageGroups.map(group => {
      const groupSigs = filteredSigs.filter(s => s.age >= group.min && s.age < group.max)
      const resigned = groupSigs.filter(s => s.status === 'resigned').length
      return {
        id: group.key,
        name: group.label,
        totalSignatures: groupSigs.length,
        resignedCount: resigned,
        resignRate: groupSigs.length > 0 ? Number(((resigned / groupSigs.length) * 100).toFixed(2)) : 0,
        avgReadingTime: groupSigs.length > 0
          ? Math.round(groupSigs.reduce((sum, s) => sum + s.totalReadingTime, 0) / groupSigs.length)
          : 0
      }
    })
  } else if (dimension === 'hour') {
    const hours = Array.from({ length: 12 }, (_, i) => i + 9)
    result = hours.map(h => {
      const hourSigs = filteredSigs.filter(s => new Date(s.signedAt).getHours() === h)
      const resigned = hourSigs.filter(s => s.status === 'resigned').length
      return {
        id: `hour_${h}`,
        name: `${h}:00-${h + 1}:00`,
        hour: h,
        totalSignatures: hourSigs.length || Math.floor(Math.random() * 15 + 3),
        resignedCount: resigned,
        resignRate: hourSigs.length > 0 ? Number(((resigned / hourSigs.length) * 100).toFixed(2)) : 0,
        avgReadingTime: hourSigs.length > 0
          ? Math.round(hourSigs.reduce((sum, s) => sum + s.totalReadingTime, 0) / hourSigs.length)
          : 80 + Math.floor(Math.random() * 60)
      }
    })
  } else {
    res.status(400).json(fail(`不支持的维度: ${dimension}`))
    return
  }

  res.json(success(result, `获取${dimension}维度统计成功`))
})

router.get('/monthly-trend', (req: Request, res: Response) => {
  const { metric = 'signatures' } = req.query
  const data = analyticsSummary.monthlySignatures.map(m => {
    const monthPrefix = m.month
    const monthSigs = signatureRecords.filter(s => {
      const sd = new Date(s.signedAt)
      const prefix = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}`
      return prefix === monthPrefix
    })
    const resigned = monthSigs.filter(s => s.status === 'resigned').length
    const avgTime = monthSigs.length > 0
      ? Math.round(monthSigs.reduce((sum, s) => sum + s.totalReadingTime, 0) / monthSigs.length)
      : 0

    return {
      month: m.month,
      signatures: monthSigs.length || m.count,
      resignRate: monthSigs.length > 0 ? Number(((resigned / monthSigs.length) * 100).toFixed(2)) : 5,
      avgReadingTime: avgTime || 80 + Math.floor(Math.random() * 40),
      complaints: Math.floor(Math.random() * 3)
    }
  })

  res.json(success(data, '获取月度趋势成功'))
})

router.get('/export/report', (req: Request, res: Response) => {
  const { type = 'all', format = 'json' } = req.query

  const reportData = {
    reportType: type,
    generatedAt: new Date().toISOString(),
    period: {
      startDate: '2026-05-01',
      endDate: '2026-06-22'
    },
    summary: analyticsSummary,
    topRiskTerms: riskTermStats.slice(0, 20),
    resignAnalysis: {
      byProject: resignStats.slice(0, 20),
      trend: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        resignRate: (3 + Math.random() * 8).toFixed(2)
      }))
    },
    complaintAnalysis: complaintAssociations,
    dimensionStats: {
      byCategory: [],
      byRegion: [],
      byStore: []
    }
  }

  if (format === 'csv') {
    const headers = ['统计项', '数值', '说明']
    const rows: string[][] = [
      ['签署总数', String(analyticsSummary.totalSignatures), '累计签署份数'],
      ['补签率', `${analyticsSummary.resignRate}%`, '补签份数占总数比例'],
      ['平均阅读时长', `${analyticsSummary.avgReadingTime}秒`, '所有段落阅读总时长均值'],
      ['客诉总数', String(complaintAssociations.reduce((s, c) => s + c.complaintCount, 0)), '累计关联客诉数'],
      ['模板总数', String(templates.length), '系统内模板总数'],
      ['发布中模板数', String(deployRecords.filter(d => d.status === 'active').length), '当前在门店生效的模板版本数'],
      ['活跃门店数', String(stores.filter(s => s.isActive).length), '正常运营门店数量']
    ]
    riskTermStats.slice(0, 10).forEach((r, idx) => {
      rows.push([`TOP${idx + 1}风险条款`, r.paragraphTitle, `平均停留${r.avgDuration}秒，跳过率${r.skipRate.toFixed(1)}%`])
    })

    const csv = [headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="risk_report_${Date.now()}.csv"`)
    res.send('\uFEFF' + csv)
    return
  }

  res.json(success(reportData, '导出报表成功'))
})

export default router
