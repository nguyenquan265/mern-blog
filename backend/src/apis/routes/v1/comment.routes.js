import express from 'express'
const router = express.Router()

import { authenticate } from '../../../middlewares/auth.middleware.js'
import {
  createComment,
  getPostComments,
  likeComment,
  editComment
} from '../../controllers/comment.controller.js'

router.post('/create', authenticate, createComment)
router.get('/getPostComments/:postId', getPostComments)
router.put('/likeComment/:commentId', authenticate, likeComment)
router.put('/editComment/:commentId', authenticate, editComment)

export default router
