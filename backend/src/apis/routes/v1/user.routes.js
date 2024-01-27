import express from 'express'
const router = express.Router()

import { authenticate } from '../../../middlewares/auth.middleware.js'
import { updateUser } from '../../controllers/user.controller.js'

router.use(authenticate)
router.put('/update/:userId', updateUser)

export default router
