import * as Mongoose from 'mongoose'

const OrderSchema = new Mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['created', 'canceled'],
      default: 'created'
    },
    total: {
      type: Number,
      required: [true, 'Please add a total price'],
      min: [0, 'Please add a valid total price, value is {VALUE}, min 0 USD']
    },
    client: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a client user']
    },
    purchases: [
      {
        item: {
          type: Mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          required: [true, 'Please add an item']
        },
        quantity: {
          type: Number,
          required: [true, 'Please add a quantity']
        }
      }
    ]
  },
  { versionKey: false }
)

export const OrderModel = Mongoose.model('Order', OrderSchema)
