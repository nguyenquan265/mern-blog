import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import statusCode from '../config/status.js'
import catchAsync from '../utils/catchAsync.js'
import ApiError from '../utils/ApiError.js'

export const authenticate = catchAsync(async (req, res, next) => {
  const token = req.cookies.access_token

  if (!token) {
    throw new ApiError(statusCode.UNAUTHORIZED, 'Unauthorized')
  }

  jwt.verify(token, env.jwt.jwt_secret, (err, user) => {
    if (err) {
      throw new ApiError(statusCode.UNAUTHORIZED, 'Unauthorized')
    }

    req.user = user
  })

  next()
})
