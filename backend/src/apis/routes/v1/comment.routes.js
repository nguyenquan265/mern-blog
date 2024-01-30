import express from 'express'
const router = express.Router()

import { authenticate } from '../../../middlewares/auth.middleware.js'
import {
  createComment,
  getPostComments
} from '../../controllers/comment.controller.js'

router.post('/create', authenticate, createComment)
router.get('/getPostComments/:postId', getPostComments)

export default router
