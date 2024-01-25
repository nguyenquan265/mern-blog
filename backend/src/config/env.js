import 'dotenv/config'

export default {
  port: process.env.PORT || 8080,
  mongo_uri: process.env.MONGO_URI
}
