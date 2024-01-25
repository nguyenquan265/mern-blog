import 'dotenv/config'

export default {
  port: process.env.PORT || 8080,
  mongo_uri: process.env.MONGO_URI,
  build_mode: process.env.BUILD_MODE,
  jwt: {
    jwt_secret: process.env.JWT_SECRET
  }
}
