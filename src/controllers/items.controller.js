import asyncHandler from 'express-async-handler'

import { ResponseException } from '#app/exceptions/index.js'
import { ItemModel } from '#app/models/index.js'

/**
 * @desc     Get all items
 * @route    GET /api/v1/items
 * @access   Private
 */
export const getAllItems = asyncHandler(async (request, response) => {
  const items = await ItemModel.find(request.query).populate('owner')
  response.status(200).json({
    status: 'success',
    data: items
  })
})

/**
 * @desc     Get single item
 * @route    GET /api/v1/items/:id
 * @access   Private
 */
export const getItem = asyncHandler(async (request, response, next) => {
  const item = await (await ItemModel.findById(request.params.id)).populate('owner')
  if (!item) {
    return next(
      new ResponseException(
        `Item not found with id of ${request.params.id}`,
        404
      )
    )
  }

  response.status(200).json({
    status: 'success',
    data: item
  })
})

/**
 * @desc     Create item
 * @route    POST /api/v1/items/:id
 * @access   Private
 */
export const createItem = asyncHandler(async (request, response) => {
  const item = await (await ItemModel.create(request.body)).populate('owner')

  response.status(201).json({
    status: 'success',
    data: item
  })
})

/**
 * @desc     Update item
 * @route    PUT /api/v1/items/:id
 * @access   Private
 */
export const updateItem = asyncHandler(async (request, response, next) => {
  let item = await ItemModel.findById(request.params.id)

  if (!item) {
    return next(
      new ResponseException(
        `Item not found with id of ${request.params.id}`,
        404
      )
    )
  }

  item = await (
    await ItemModel.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    })
  ).populate('owner')

  response.status(203).json({
    status: 'success',
    data: item
  })
})

/**
 * @desc     Delete item
 * @route    DELETE /api/v1/items/:id
 * @access   Private
 */
export const deleteItem = asyncHandler(async (request, response, next) => {
  const item = await ItemModel.findById(request.params.id)

  if (!item) {
    return next(
      new ResponseException(
        `Item not found with id of ${request.params.id}`,
        404
      )
    )
  }

  await ItemModel.findByIdAndRemove(request.params.id)

  response.status(204).json({
    status: 'success',
    data: {}
  })
})
