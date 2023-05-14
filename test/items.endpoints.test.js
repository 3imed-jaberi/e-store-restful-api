import Mongoose from 'mongoose'

import '#app/config/env-loader'
import { dbConnect } from '#app/config/db-connect.js'
import { app } from '#app/app.js'

import supertest from 'supertest'
import { ItemModel, UserModel } from '#app/models'

describe('Items Endpoint (/api/v1/items)', () => {
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
  let persistedUserResponse, createdItemId
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
    await Mongoose.connection.close()
  })

  afterAll(async () => {
    await dbConnect()
    await UserModel.findOneAndRemove({ email: userData.email })
    await ItemModel.findOneAndRemove({ name: getItemData().name })
    if (server?.listening) server.close()
    await Mongoose.connection.close()
  })

  beforeEach(async () => {
    await dbConnect()
    server = app.listen()
  })

  afterEach(async () => {
    if (server?.listening) server.close()
    await Mongoose.connection.close()
  })

  it('GET / [success]', async () => {
    const response = await supertest(server)
      .get('/api/v1/items')
      .set('authorization', `Bearer ${persistedUserResponse.token}`)

    expect(response.status).toBe(200)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()
  })

  it('GET / with query-params [success]', async () => {
    const createdItems = await ItemModel.create([
      {
        name: 'water boat',
        description: "it's a great product!",
        price: 10,
        quantity: 1000,
        owner: '6460ebed27d9e25ce19fb34f'
      },
      {
        name: 'phone',
        description: "it's a great product!",
        price: 10,
        quantity: 3000,
        owner: '6460ebed27d9e25ce19fb34f'
      }
    ])

    const response = await supertest(server)
      .get('/api/v1/items?name=phone')
      .set('authorization', `Bearer ${persistedUserResponse.token}`)

    expect(response.status).toBe(200)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()
    expect(response.body.data.at(0).name).toBe('phone')
    await ItemModel.deleteMany({ _id: { $in: createdItems.map(item => item._id.toString()) } })
  })

  it('POST / [success]', async () => {
    const response = await supertest(server)
      .post('/api/v1/items')
      .set('authorization', `Bearer ${persistedUserResponse.token}`)
      .send(getItemData())

    expect(response.status).toBe(201)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()

    createdItemId = response.body.data._id

    expect(response.body.data).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        quantity: expect.any(Number),
        owner: expect.any(Object),
        _id: expect.any(String)
      })
    )
  })

  it('GET /:id [success]', async () => {
    const response = await supertest(server)
      .get(`/api/v1/items/${createdItemId}`)
      .set('authorization', `Bearer ${persistedUserResponse.token}`)

    expect(response.status).toBe(200)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()
    expect(response.body.data).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        quantity: expect.any(Number),
        owner: expect.any(Object),
        _id: expect.any(String)
      })
    )
  })

  it('PUT /:id [success]', async () => {
    const requestBody = {
      ...getItemData(),
      name: 'next water name'
    }
    const response = await supertest(server)
      .put(`/api/v1/items/${createdItemId}`)
      .set('authorization', `Bearer ${persistedUserResponse.token}`)
      .send(requestBody)

    expect(response.status).toBe(203)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()
    expect(response.body.data).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        quantity: expect.any(Number),
        owner: expect.any(Object),
        _id: expect.any(String)
      })
    )
    expect(response.body.data.name).toBe(requestBody.name)
  })

  it('DELETE /:id [success]', async () => {
    const response = await supertest(server)
      .delete(`/api/v1/items/${createdItemId}`)
      .set('authorization', `Bearer ${persistedUserResponse.token}`)

    expect(response.status).toBe(204)
  })
})
