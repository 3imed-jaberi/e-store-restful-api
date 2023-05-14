import { Router as ExpressRouter } from 'express'

import { itemsCtrl } from '#app/controllers/index.js'
import { protect } from '#app/middlewares/index.js'

const itemsRouter = ExpressRouter()

itemsRouter
  .route('/')
  .get(protect, itemsCtrl.getAllItems)
  .post(protect, itemsCtrl.createItem)

itemsRouter
  .route('/:id')
  .get(protect, itemsCtrl.getItem)
  .put(protect, itemsCtrl.updateItem)
  .delete(protect, itemsCtrl.deleteItem)

export { itemsRouter }
