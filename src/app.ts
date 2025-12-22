import express from 'express'
import cors from 'cors'

import { httpLoggerMiddleware } from '@/middlewares/httpLogger.middleware.js'
import routes from '@/routes/index.js'
import { errorMiddleware } from '@/middlewares/error.middleware.js'
import { config } from '@/config/index.js'

const app = express()

app.use(httpLoggerMiddleware)
app.use(cors(config.cors))
app.use(express.json())

app.use(config.app.apiPrefix, routes)

app.use(errorMiddleware)

export default app
