import express from 'express'
const router = express.Router()

import { authenticate } from '../../../middlewares/auth.middleware.js'
import {
  updateUser,
  deleteUser,
  getUsers,
  getUser
} from '../../controllers/user.controller.js'

router.put('/update/:userId', authenticate, updateUser)
router.delete('/delete/:userId', authenticate, deleteUser)
router.get('/getUsers', authenticate, getUsers)

router.get('/getUser/:userId', getUser)

export default router
