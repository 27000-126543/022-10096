import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import templateRoutes from './routes/templates.js'
import projectRoutes from './routes/projects.js'
import reviewRoutes from './routes/reviews.js'
import deployRoutes from './routes/deploy.js'
import signatureRoutes from './routes/signatures.js'
import analyticsRoutes from './routes/analytics.js'
import { users, type ApiResponse } from './data/mockData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use((req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res)
  res.json = ((body: any) => {
    if (body && typeof body === 'object' && 'success' in body) {
      return originalJson(body)
    }
    const wrapped: ApiResponse<typeof body> = {
      success: true,
      data: body,
      message: 'ok'
    }
    return originalJson(wrapped)
  }) as typeof res.json
  next()
})

app.get('/api/users', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: users,
    message: '获取用户列表成功',
    total: users.length
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/deploy', deployRoutes)
app.use('/api/signatures', signatureRoutes)
app.use('/api/analytics', analyticsRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        routes: {
          auth: '/api/auth',
          templates: '/api/templates',
          projects: '/api/projects',
          reviews: '/api/reviews',
          deploy: '/api/deploy',
          signatures: '/api/signatures',
          analytics: '/api/analytics'
        }
      },
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server Error]', error)
  res.status(500).json({
    success: false,
    data: null,
    message: `Server internal error: ${error.message}`,
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `API not found: ${req.method} ${req.path}`,
  })
})

export default app
