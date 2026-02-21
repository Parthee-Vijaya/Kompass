import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { config } from './config/env.js'
import { employeesRouter } from './routes/employees.js'
import { tasksRouter } from './routes/tasks.js'
import { routesRouter } from './routes/routes.js'
import { optimizeRouter } from './routes/optimize.js'
import { clientsRouter } from './routes/clients.js'
import { schedulesRouter } from './routes/schedules.js'
import { complianceRouter } from './routes/compliance.js'
import { analyticsRouter } from './routes/analytics.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
})

app.use(helmet())
app.use(cors({ origin: config.FRONTEND_URL }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/employees', employeesRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/routes', routesRouter)
app.use('/api/optimize', optimizeRouter)
app.use('/api/clients', clientsRouter)
app.use('/api/schedules', schedulesRouter)
app.use('/api/compliance', complianceRouter)
app.use('/api/analytics', analyticsRouter)

app.use(errorHandler)

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('join-team', (teamId: string) => {
    socket.join(`team:${teamId}`)
    console.log(`Socket ${socket.id} joined team:${teamId}`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

export { io }

httpServer.listen(config.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}`)
  console.log(`📡 WebSocket server ready`)
})
