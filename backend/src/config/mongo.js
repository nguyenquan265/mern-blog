import mongoose from 'mongoose'
import env from './env.js'

export const connectMongo = async () => {
  await mongoose
    .connect(env.mongo_uri)
    .then(console.log('Connect db successfully!'))
    .catch((err) => console.error(err))
}
