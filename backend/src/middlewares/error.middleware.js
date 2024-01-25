import statusCode from '../config/status.js'
import env from '../config/env.js'

export default (err, req, res, next) => {
  if (!err.statusCode) err.statusCode = statusCode.INTERNAL_SERVER_ERROR
  // if (err.stack.startsWith('ValidationError')) err.statusCode = 422

  const responseError = {
    success: false,
    statusCode: err.statusCode,
    message: err.message || statusCode[err.statusCode],
    stack: err.stack
  }
  console.error(responseError)

  if (env.build_mode !== 'dev') delete responseError.stack

  res.status(responseError.statusCode).json(responseError)
}
