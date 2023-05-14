import asyncHandler from 'express-async-handler'

import { ResponseException } from '#app/exceptions/index.js'
import { jwtUtils } from '#app/utils/index.js'
import { UserModel } from '#app/models/index.js'

export const protect = asyncHandler(async (request, _, next) => {
  const token = request.headers?.authorization?.split(' ')[1]
  if (!token) {
    return next(
      new ResponseException('Not authorized to access this route', 401)
    )
  }

  try {
    const decoded = jwtUtils.verifyToken(token)
    console.log(decoded)
    request.user = await UserModel.findById(decoded.id)
    next()
  } catch (error) {
    return next(
      new ResponseException('Not authorized to access this route', 401)
    )
  }
})

export const hasRole = (...roles) => {
  return (request, _, next) => {
    if (!roles.includes(request.user.role)) {
      return next(
        new ResponseException(
          `User role ${request.user.role} is not authorized to access this route`,
          403
        )
      )
    }
    next()
  }
}
