import express from 'express'
const router = express.Router()

import { authenticate } from '../../../middlewares/auth.middleware.js'
import { create, getPosts } from '../../controllers/post.controller.js'

router.post('/create', authenticate, create)
router.get('/getPosts', getPosts)

export default router
