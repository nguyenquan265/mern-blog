import express from 'express'
const router = express.Router()

import { authenticate } from '../../../middlewares/auth.middleware.js'
import { create } from '../../controllers/post.controller.js'

router.post('/create', authenticate, create)

export default router
