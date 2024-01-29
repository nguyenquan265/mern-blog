import express from 'express'
const router = express.Router()

import { authenticate } from '../../../middlewares/auth.middleware.js'
import {
  create,
  getPosts,
  deletePost,
  updatePost
} from '../../controllers/post.controller.js'

router.post('/create', authenticate, create)
router.get('/getPosts', getPosts)
router.delete('/deletePost/:postId/:userId', authenticate, deletePost)
router.put('/updatePost/:postId/:userId', authenticate, updatePost)

export default router
