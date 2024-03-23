require('dotenv').config()
const https = require('https')
const cron = require('node-cron')

const serverToPing = process.env.SERVER

const handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const req = https.get(serverToPing, (res) => {
      if (res.statusCode === 200) {
        resolve({
          statusCode: 200,
          body: 'Server pinged successfully'
        })
      } else {
        reject(
          new Error(`Server ping failed with status code: ${res.statusCode}`)
        )
      }
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.end()
  })
}

cron.schedule('*/14 * * * *', () => {
  handler()
})
