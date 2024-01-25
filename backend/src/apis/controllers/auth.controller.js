import User from '../models/user.model.js'
import catchAsync from '../../utils/catchAsync.js'
import ApiError from '../../utils/ApiError.js'
import statusCode from '../../config/status.js'

export const signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    throw new ApiError(statusCode.BAD_REQUEST, 'All fields are required')
  }

  await User.create({ username, email, password })

  res.status(statusCode.CREATED).json({ msg: 'Signup successfully' })
})
