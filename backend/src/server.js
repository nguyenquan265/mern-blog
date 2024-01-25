import express from 'express'

import env from './config/env.js'
import { connectMongo } from './config/mongo.js'

import APIs_V1 from './apis/routes/v1'
import errorMiddleware from './middlewares/error.middleware.js'

const start = () => {
  const app = express()
  const port = env.port

  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  app.use('/api/v1', APIs_V1)
  app.use(errorMiddleware)

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
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
