import { ResponseException } from '#app/exceptions/index.js'

export const errorHandler = (exception, request, response, next) => {
  let error = { ...exception }

  error.message = exception.message

  // Log to console for dev
  console.error(exception)

  // Mongoose bad ObjectId
  if (exception.name === 'CastError') {
    const message = 'Resource not found'
    error = new ResponseException(message, 404)
  }

  // Mongoose duplicate key
  if (exception.code === 11000) {
    const message = 'Duplicate field value entered'
    error = new ResponseException(message, 400)
  }

  // Mongoose validation error
  if (exception.name === 'ValidationError') {
    const message = Object.values(exception.errors).map(
      (value) => value.message
    )
    error = new ResponseException(message, 400)
  }

  response.status(error.statusCode || 500).json({
    status: 'failed',
    error: error.message || 'Server Error'
  })
}
