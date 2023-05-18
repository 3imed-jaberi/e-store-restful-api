import Mongoose from 'mongoose'

import '#app/config/env-loader'
import { dbConnect } from '#app/config/db-connect.js'
import { app } from '#app/app.js'

import supertest from 'supertest'
import { ItemModel, UserModel } from '#app/models'

describe('Orders Endpoint (/api/v1/orders)', () => {
  let server
  const userData = {
    fullname: 'client t101',
    email: 'client-t101@app.io',
    password: 'client-t101'
  }
  const getItemData = () => ({
    name: 'water boat',
    description: "it's a great product!",
    price: 10,
    quantity: 1000,
    owner: persistedUserResponse?.user?._id
  })
  const getOrderData = async () => ({
    total: 110,
    client: persistedUserResponse?.user?._id,
    purchases: [
      {
        item: (await ItemModel.find()).at(0)._id.toString(),
        quantity: 2
      }
    ]
  })
  let persistedUserResponse, createdOrderId
  beforeAll(async () => {
    await dbConnect()
    await UserModel.findOneAndRemove({ email: userData.email })
    await ItemModel.findOneAndRemove({ name: getItemData().name })
    server = app.listen()
    const response = await supertest(server)
      .post('/api/v1/auth/signup')
      .send(userData)
    persistedUserResponse = response.body.data
    if (server?.listening) server.close()
  })

  afterAll(async () => {
    await dbConnect()
    await UserModel.findOneAndRemove({ email: userData.email })
    await ItemModel.findOneAndRemove({ name: getItemData().name })
    if (server?.listening) server.close()
    await Mongoose.connection.close()
  })

  beforeEach(async () => {
    server = app.listen()
  })

  afterEach(async () => {
    if (server?.listening) server.close()
  })

  it('GET / [success]', async () => {
    const response = await supertest(server)
      .get('/api/v1/orders')
      .set('authorization', `Bearer ${persistedUserResponse.token}`)

    expect(response.status).toBe(200)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()
  })

  it('POST / [success]', async () => {
    const response = await supertest(server)
      .post('/api/v1/orders')
      .set('authorization', `Bearer ${persistedUserResponse.token}`)
      .send(await getOrderData())

    expect(response.status).toBe(201)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()
    createdOrderId = response.body.data._id
  })

  it('GET /:id [success]', async () => {
    const response = await supertest(server)
      .get(`/api/v1/orders/${createdOrderId}`)
      .set('authorization', `Bearer ${persistedUserResponse.token}`)

    expect(response.status).toBe(200)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()
  })

  it('PATCH /:id [success]', async () => {
    const requestBody = {
      ...(await getOrderData()),
      status: 'canceled'
    }
    const response = await supertest(server)
      .patch(`/api/v1/orders/${createdOrderId}`)
      .set('authorization', `Bearer ${persistedUserResponse.token}`)
      .send(requestBody)

    expect(response.status).toBe(203)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()
    expect(response.body.data.status).toBe(requestBody.status)
  })

  it('PUT /:id [success]', async () => {
    const requestBody = {
      ...(await getOrderData()),
      status: 'created'
    }
    const response = await supertest(server)
      .put(`/api/v1/orders/${createdOrderId}`)
      .set('authorization', `Bearer ${persistedUserResponse.token}`)
      .send(requestBody)

    expect(response.status).toBe(203)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()
    expect(response.body.data.status).toBe(requestBody.status)
  })

  it('DELETE /:id [success]', async () => {
    const response = await supertest(server)
      .delete(`/api/v1/orders/${createdOrderId}`)
      .set('authorization', `Bearer ${persistedUserResponse.token}`)

    expect(response.status).toBe(204)
  })
})
