import Mongoose from 'mongoose'

export const dbConnect = async () => {
  await Mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  console.log('-- 🥞 DB Connected Successfully')
}

dbConnect()
