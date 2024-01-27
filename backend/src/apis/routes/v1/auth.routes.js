import express from 'express'
const router = express.Router()

import {
  signup,
  signin,
  google,
  signout
} from '../../controllers/auth.controller.js'

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/google', google)
router.post('/signout', signout)

export default router
