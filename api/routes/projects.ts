import { Router, type Request, type Response } from 'express'
import {
  projects,
  templates,
  type Project,
  type ApiResponse
} from '../data/mockData.js'

const router = Router()

function success<T>(data: T, message = '操作成功', total?: number, page?: number, pageSize?: number): ApiResponse<T> {
  return { success: true, data, message, total, page, pageSize }
}

function fail(message: string): ApiResponse<null> {
  return { success: false, data: null, message }
}

interface ProjectTreeNode extends Project {
  children?: ProjectTreeNode[]
  mappedTemplateCount: number
}

function buildTree(list: Project[]): ProjectTreeNode[] {
  const map = new Map<string, ProjectTreeNode>()
  list.forEach(p => {
    map.set(p.id, {
      ...p,
      mappedTemplateCount: p.mappedTemplateVersions.length,
      children: []
    })
  })

  const roots: ProjectTreeNode[] = []
  map.forEach(node => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  function sortChildren(nodes: ProjectTreeNode[]) {
    nodes.sort((a, b) => a.sort - b.sort)
    nodes.forEach(n => {
      if (n.children && n.children.length > 0) {
        sortChildren(n.children)
        n.mappedTemplateCount += n.children.reduce((sum, c) => sum + c.mappedTemplateCount, 0)
      }
    })
  }
  sortChildren(roots)

  return roots
}

router.get('/tree', (req: Request, res: Response) => {
  const { categoryId } = req.query
  let list = [...projects]
  if (categoryId && categoryId !== 'all') {
    const catProjects = projects.filter(p => p.categoryId === categoryId)
    const catIds = new Set(catProjects.map(p => p.id))
    catProjects.forEach(p => {
      if (p.parentId) catIds.add(p.parentId)
    })
    list = projects.filter(p => catIds.has(p.id))
  }

  const tree = buildTree(list)
  res.json(success(tree, '获取项目树成功'))
})

router.get('/flat', (req: Request, res: Response) => {
  const { categoryId, level, keyword, page = '1', pageSize = '50' } = req.query
  let list = [...projects]

  if (categoryId && categoryId !== 'all') {
    list = list.filter(p => p.categoryId === categoryId)
  }
  if (level) {
    list = list.filter(p => p.level === Number(level))
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(kw))
  }

  const total = list.length
  const pageNum = parseInt(String(page), 10)
  const pageSizeNum = parseInt(String(pageSize), 10)
  const start = (pageNum - 1) * pageSizeNum
  const paginated = list.slice(start, start + pageSizeNum)

  res.json(success(paginated, '获取项目列表成功', total, pageNum, pageSizeNum))
})

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const project = projects.find(p => p.id === id)
  if (!project) {
    res.status(404).json(fail('项目不存在'))
    return
  }
  res.json(success(project, '获取项目详情成功'))
})

router.post('/', (req: Request, res: Response) => {
  const { name, categoryId, categoryName, parentId = null, level = 1, sort } = req.body
  const newId = `prj${String(projects.length + 1).padStart(3, '0')}`

  const newProject: Project = {
    id: newId,
    name: name || '新项目',
    categoryId,
    categoryName: categoryName || '注射美容',
    parentId,
    level,
    sort: sort ?? projects.length,
    mappedTemplateVersions: []
  }

  projects.push(newProject)
  res.json(success(newProject, '创建项目成功'))
})

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { name, categoryId, categoryName, parentId, level, sort } = req.body
  const project = projects.find(p => p.id === id)

  if (!project) {
    res.status(404).json(fail('项目不存在'))
    return
  }

  if (name !== undefined) project.name = name
  if (categoryId !== undefined) project.categoryId = categoryId
  if (categoryName !== undefined) project.categoryName = categoryName
  if (parentId !== undefined) project.parentId = parentId
  if (level !== undefined) project.level = level
  if (sort !== undefined) project.sort = sort

  res.json(success(project, '更新项目成功'))
})

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const idx = projects.findIndex(p => p.id === id)
  if (idx === -1) {
    res.status(404).json(fail('项目不存在'))
    return
  }
  projects.splice(idx, 1)
  res.json(success(null, '删除项目成功'))
})

router.get('/:id/mappings', (req: Request, res: Response) => {
  const { id } = req.params
  const project = projects.find(p => p.id === id)
  if (!project) {
    res.status(404).json(fail('项目不存在'))
    return
  }

  const mappings = project.mappedTemplateVersions.map(m => {
    const template = templates.find(t => t.id === m.templateId)
    return {
      ...m,
      templateName: template?.name,
      templateStatus: template?.status
    }
  })

  res.json(success(mappings, '获取映射配置成功'))
})

router.put('/:id/mappings', (req: Request, res: Response) => {
  const { id } = req.params
  const { mappings } = req.body as {
    mappings: {
      type: 'adult' | 'minor' | 'retreatment'
      templateId: string
      versionId: string
      version: string
    }[]
  }
  const project = projects.find(p => p.id === id)

  if (!project) {
    res.status(404).json(fail('项目不存在'))
    return
  }

  project.mappedTemplateVersions = mappings || []
  res.json(success(project.mappedTemplateVersions, '更新映射成功'))
})

router.post('/:id/mappings', (req: Request, res: Response) => {
  const { id } = req.params
  const mapping = req.body as {
    type: 'adult' | 'minor' | 'retreatment'
    templateId: string
    versionId: string
    version: string
  }
  const project = projects.find(p => p.id === id)

  if (!project) {
    res.status(404).json(fail('项目不存在'))
    return
  }

  const existIdx = project.mappedTemplateVersions.findIndex(m => m.type === mapping.type)
  if (existIdx >= 0) {
    project.mappedTemplateVersions[existIdx] = mapping
  } else {
    project.mappedTemplateVersions.push(mapping)
  }

  res.json(success(project.mappedTemplateVersions, '添加映射成功'))
})

router.delete('/:id/mappings/:type', (req: Request, res: Response) => {
  const { id, type } = req.params
  const project = projects.find(p => p.id === id)

  if (!project) {
    res.status(404).json(fail('项目不存在'))
    return
  }

  const before = project.mappedTemplateVersions.length
  project.mappedTemplateVersions = project.mappedTemplateVersions.filter(m => m.type !== type)

  if (before === project.mappedTemplateVersions.length) {
    res.status(404).json(fail('映射不存在'))
    return
  }

  res.json(success(project.mappedTemplateVersions, '删除映射成功'))
})

router.get('/:id/available-templates', (req: Request, res: Response) => {
  const { categoryId } = req.query
  const list = templates.filter(t => {
    if (categoryId && categoryId !== 'all') {
      return t.category === categoryId && t.status === 'approved'
    }
    return t.status === 'approved' || t.status === 'published'
  }).map(t => {
    const publishedVersion = t.versions.find(v => v.isPublished) || t.versions[0]
    return {
      id: t.id,
      name: t.name,
      category: t.category,
      categoryName: t.categoryName,
      currentVersionId: publishedVersion?.id,
      currentVersion: publishedVersion?.version,
      status: t.status
    }
  })

  res.json(success(list, '获取可用模板成功'))
})

export default router
