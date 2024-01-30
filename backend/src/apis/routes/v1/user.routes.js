import express from 'express'
const router = express.Router()

import { authenticate } from '../../../middlewares/auth.middleware.js'
import {
  updateUser,
  deleteUser,
  getUsers
} from '../../controllers/user.controller.js'

router.use(authenticate)
router.put('/update/:userId', updateUser)
router.delete('/delete/:userId', deleteUser)
router.get('/getUsers', getUsers)

export default router
