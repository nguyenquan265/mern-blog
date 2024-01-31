import express from 'express'
const router = express.Router()

import { authenticate } from '../../../middlewares/auth.middleware.js'
import {
  createComment,
  getPostComments,
  likeComment
} from '../../controllers/comment.controller.js'

router.post('/create', authenticate, createComment)
router.get('/getPostComments/:postId', getPostComments)
router.put('/likeComment/:commentId', authenticate, likeComment)

export default router
