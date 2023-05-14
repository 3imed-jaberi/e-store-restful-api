import asyncHandler from 'express-async-handler'

import { ResponseException } from '#app/exceptions/index.js'
import { ItemModel, OrderModel } from '#app/models/index.js'

/**
 * @desc     Get all orders
 * @route    GET /api/v1/orders
 * @access   Private
 */
export const getAllOrders = asyncHandler(async (request, response) => {
  const orders = await OrderModel.find()
  response.status(200).json({
    status: 'success',
    data: orders
  })
})

/**
 * @desc     Get single order
 * @route    GET /api/v1/orders/:id
 * @access   Private
 */
export const getOrder = asyncHandler(async (request, response, next) => {
  const order = await OrderModel.findById(request.params.id)
  if (!order) {
    return next(
      new ResponseException(
        `Order not found with id of ${request.params.id}`,
        404
      )
    )
  }

  response.status(200).json({
    status: 'success',
    data: order
  })
})

/**
 * Shared logic between createOrder and updateOrder
 */
const syncItemsAndGetTotalPrices = async (purchases) => {
  const stock = await ItemModel.find({
    _id: { $in: purchases.map((p) => p.item) }
  })

  let total = 0
  stock.forEach(async (item) => {
    const targetPurchase = purchases.find(
      (p) => p.item === item._id.toString()
    )
    const nextQuantity = item.quantity - targetPurchase.quantity
    total += item.price * targetPurchase.quantity
    await ItemModel.findByIdAndUpdate(targetPurchase.item, { quantity: nextQuantity }, { runValidators: true })
  })

  return { total }
}

/**
 * @desc     Create order
 * @route    POST /api/v1/orders/:id
 * @access   Private
 */
export const createOrder = asyncHandler(async (request, response) => {
  const { client, purchases, ...requestBody } = request.body
  const { total } = await syncItemsAndGetTotalPrices(purchases)

  const order = await (
    await OrderModel.create({ ...requestBody, total, client, purchases })
  ).populate('client purchases.item')

  response.status(201).json({
    status: 'success',
    data: order
  })
})

/**
 * @desc     Update order
 * @route    PUT /api/v1/orders/:id
 * @access   Private
 */
export const updateOrder = asyncHandler(async (request, response, next) => {
  let order = await OrderModel.findById(request.params.id)

  if (!order) {
    return next(
      new ResponseException(
        `Order not found with id of ${request.params.id}`,
        404
      )
    )
  }

  const { client, purchases, ...requestBody } = request.body
  const { total } = await syncItemsAndGetTotalPrices(purchases)
  order = await OrderModel.findByIdAndUpdate(request.params.id, { ...requestBody, total, client, purchases }, {
    new: true,
    runValidators: true
  })

  response.status(203).json({
    status: 'success',
    data: order
  })
})

/**
 * @desc     Update order status
 * @route    PATCH /api/v1/orders/:id
 * @access   Private
 */
export const updateOrderStatus = asyncHandler(
  async (request, response, next) => {
    let order = await OrderModel.findById(request.params.id)

    if (!order) {
      return next(
        new ResponseException(
          `Order not found with id of ${request.params.id}`,
          404
        )
      )
    }
    const { status } = request.body
    order = await OrderModel.findByIdAndUpdate(
      request.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    )

    response.status(203).json({
      status: 'success',
      data: order
    })
  }
)

/**
 * @desc     Delete order
 * @route    DELETE /api/v1/orders/:id
 * @access   Private
 */
export const deleteOrder = asyncHandler(async (request, response, next) => {
  const order = await OrderModel.findById(request.params.id)

  if (!order) {
    return next(
      new ResponseException(
        `Order not found with id of ${request.params.id}`,
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
