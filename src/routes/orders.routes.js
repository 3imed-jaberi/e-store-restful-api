import { Router as ExpressRouter } from 'express'

import { ordersCtrl } from '#app/controllers/index.js'
import { protect } from '#app/middlewares/index.js'

const ordersRouter = ExpressRouter()

ordersRouter
  .route('/')
  .get(protect, ordersCtrl.getAllOrders)
  .post(protect, ordersCtrl.createOrder)

ordersRouter
  .route('/:id')
  .get(protect, ordersCtrl.getOrder)
  .put(protect, ordersCtrl.updateOrder)
  .patch(protect, ordersCtrl.updateOrderStatus)
  .delete(protect, ordersCtrl.deleteOrder)

export { ordersRouter }
