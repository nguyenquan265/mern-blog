import express from 'express'

import env from './config/env.js'
import { connectMongo } from './config/mongo.js'

const start = () => {
  const app = express()
  const port = env.port

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
