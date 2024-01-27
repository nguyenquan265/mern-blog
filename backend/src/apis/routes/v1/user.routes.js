import express from 'express'
const router = express.Router()

import { authenticate } from '../../../middlewares/auth.middleware.js'
import { updateUser, deleteUser } from '../../controllers/user.controller.js'

router.use(authenticate)
router.put('/update/:userId', updateUser)
router.delete('/delete/:userId', deleteUser)

export default router
