import path from 'node:path'
import fs from 'node:fs/promises'

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
  const item = await ItemModel.findById(request.params.id).populate('owner')
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
export const createItem = asyncHandler(async (request, response, next) => {
  const createItemResponse = async (payload) => {
    const createdItem = await ItemModel.create(payload).then(
      (createdItem) => createdItem.populate('owner')
    )

    return response.status(201).json({
      status: 'success',
      data: createdItem
    })
  }
  const file = request.files?.photo

  if (!file) {
    await createItemResponse(request.body)
    return
  }

  if (!request.body.name) { return next(new ResponseException('Please add a name', 400)) }

  if (!file.mimetype.startsWith('image')) { return next(new ResponseException('Please upload an image file', 400)) }

  file.name = `photo_${request.body.name}${path.parse(file.name).ext}`
  const targetFileUploadedPath = `uploads/${file.name}`
  file.mv(targetFileUploadedPath, async (error) => {
    if (error) {
      console.error(error)
      return next(new ResponseException('Problem with file upload', 500))
    }

    await createItemResponse({ ...request.body, photo: targetFileUploadedPath })
  })
})

/**
 * @desc     Update item
 * @route    PUT /api/v1/items/:id
 * @access   Private
 */
export const updateItem = asyncHandler(async (request, response, next) => {
  const foundedItem = await ItemModel.findById(request.params.id)

  if (!foundedItem) {
    return next(
      new ResponseException(
        `Item not found with id of ${request.params.id}`,
        404
      )
    )
  }

  const updatedItemResponse = async (id, payload) => {
    const updatedItem = await ItemModel
      .findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
      }).then(updatedItem => updatedItem.populate('owner'))

    return response.status(203).json({
      status: 'success',
      data: updatedItem
    })
  }

  const file = request.files?.photo
  if (!file) {
    await updatedItemResponse(request.params.id, request.body)
    return
  }

  if (!file.mimetype.startsWith('image')) { return next(new ResponseException('Please upload an image file', 400)) }

  await fs.rm(foundedItem.photo)
  file.name = `photo_${foundedItem.name}${path.parse(file.name).ext}`
  const targetFileUploadedPath = `uploads/${file.name}`
  file.mv(targetFileUploadedPath, async (error) => {
    if (error) {
      console.error(error)
      return next(new ResponseException('Problem with file upload', 500))
    }

    await updatedItemResponse(request.params.id, { ...request.body, photo: targetFileUploadedPath })
  })
})

/**
 * @desc     Delete item
 * @route    DELETE /api/v1/items/:id
 * @access   Private
 */
export const deleteItem = asyncHandler(async (request, response, next) => {
  const foundedItem = await ItemModel.findById(request.params.id)

  if (!foundedItem) {
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
