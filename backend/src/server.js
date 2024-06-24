import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors.js'
import cookieParser from 'cookie-parser'

import env from './config/env.js'
import { connectMongo } from './config/mongo.js'

import APIs_V1 from './apis/routes/v1'
import errorMiddleware from './middlewares/error.middleware.js'
import cron from './cron'

cron.start()

const start = () => {
  const app = express()
  const port = env.port

  app.use(cors(corsOptions))

  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())
  app.use(cookieParser())

  app.use('/api/v1', APIs_V1)
  app.use(errorMiddleware)

  if (env.build_mode === 'prod') {
    app.listen(process.env.PORT, () => {
      console.log(`Pro: Server is running on port ${process.env.PORT}`)
    })
  } else {
    app.listen(port, () => {
      console.log(`Dev: Server is running on port ${port}`)
    })
  }
}

;(async () => {
  try {
    await connectMongo()

    start()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
