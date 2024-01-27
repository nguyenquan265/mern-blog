import User from '../models/user.model.js'
import catchAsync from '../../utils/catchAsync.js'
import ApiError from '../../utils/ApiError.js'
import statusCode from '../../config/status.js'

export const updateUser = catchAsync(async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    throw new ApiError(
      statusCode.FORBIDDEN,
      'You are not allowed to update this user'
    )
  }

  const user = await User.findById(req.user.id)

  if (req.body.currentPassword && req.body.newPassword) {
    if (req.body.currentPassword === req.body.newPassword) {
      throw new ApiError(statusCode.BAD_REQUEST, 'Password must not the same')
    }

    if (!(await user.comparePassword(req.body.currentPassword))) {
      throw new ApiError(statusCode.UNAUTHORIZED, 'Incorrect current password')
    }

    if (req.body.newPassword.length < 6) {
      throw new ApiError(
        statusCode.BAD_REQUEST,
        'Password must be at least 6 characters'
      )
    }

    user.password = req.body.newPassword
  }

  if (req.body.username) {
    if (req.body.username.length < 5 || req.body.username.length > 20) {
      throw new ApiError(
        statusCode.BAD_REQUEST,
        'Username must be between 5 and 20 characters'
      )
    }

    if (req.body.username.includes(' ')) {
      throw new ApiError(
        statusCode.BAD_REQUEST,
        'Username can not contain space'
      )
    }

    if (req.body.username !== req.body.username.toLowerCase()) {
      throw new ApiError(statusCode.BAD_REQUEST, 'Username must be lowercase')
    }

    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      throw new ApiError(
        statusCode.BAD_REQUEST,
        'Username can only contain letters and numbers'
      )
    }

    user.username = req.body.username
  }

  if (req.body.email) {
    if (req.body.email !== user.email) {
      if (await User.findOne({ email: req.body.email })) {
        throw new ApiError(statusCode.BAD_REQUEST, 'Email already taken')
      }

      user.email = req.body.email
    }
  }

  await user.save()
  const { password: pass, ...rest } = user._doc

  res
    .status(statusCode.OK)
    .json({ message: 'Update user profile successfully', user: rest })
})
