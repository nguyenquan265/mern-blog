import { WHITELIST_DOMAINS } from '../utils/constants.js'
import env from './env.js'
import statusCode from './status.js'
import ApiError from '../utils/ApiError.js'

export const corsOptions = {
  origin: function (origin, callback) {
    if (!origin && env.build_mode === 'dev') {
      return callback(null, true)
    }

    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    return callback(
      new ApiError(
        statusCode.FORBIDDEN,
        `${origin} not allowed by our CORS Policy.`
      )
    )
  },

  optionsSuccessStatus: 200,
  credentials: true
}
