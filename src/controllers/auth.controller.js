import asyncHandler from 'express-async-handler'

import { ResponseException } from '#app/exceptions/index.js'
import { UserModel } from '#app/models/index.js'
import { hashUtils, jwtUtils } from '#app/utils/index.js'

/**
 * @desc     Register user
 * @route    POST /api/v1/auth/signup
 * @access   Public
 */
export const register = asyncHandler(async (request, response) => {
  const { password, ...requestBody } = request.body
  const user = await UserModel.create({
    ...requestBody,
    password: await hashUtils.hashPassword(password)
  })

  response.status(201).json({
    status: 'success',
    data: { user, token: jwtUtils.generateToken(user._id) }
  })
})

/**
 * @desc     Login user
 * @route    POST /api/v1/auth/login
 * @access   Public
 */
export const login = asyncHandler(async (request, response, next) => {
  const { email, password } = request.body
  if (!email || !password) {
    return next(
      new ResponseException('Please provide an email and password', 400)
    )
  }

  const user = await UserModel.findOne({ email }).select('+password')
  if (!user) {
    return next(new ResponseException('Invalid credentials', 400))
  }
  const isMatched = await hashUtils.isPasswordMatched(password, user.password)
  if (!isMatched) {
    return next(new ResponseException('Invalid credentials', 400))
  }

  response.status(200).json({
    status: 'success',
    data: { token: jwtUtils.generateToken(user._id) }
  })
})
