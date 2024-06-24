import express from 'express'
const router = express.Router()

import authRoute from './auth.routes.js'
import userRoute from './user.routes.js'
import postRoute from './post.routes.js'
import commentRoute from './comment.routes.js'

import ApiError from '../../../utils/ApiError.js'
import statusCode from '../../../config/status.js'

router.use('/check', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running' })
})
router.use('/auth', authRoute)
router.use('/users', userRoute)
router.use('/posts', postRoute)
router.use('/comments', commentRoute)
router.all('*', (req, res) => {
  throw new ApiError(
    statusCode.NOT_FOUND,
    `Can't find ${req.originalUrl} on this server!`
  )
})

export default router
