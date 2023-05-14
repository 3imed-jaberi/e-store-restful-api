import Mongoose from 'mongoose'

import '#app/config/env-loader'
import { dbConnect } from '#app/config/db-connect.js'
import { app } from '#app/app.js'

import supertest from 'supertest'
import { UserModel } from '#app/models'

describe('Auth Endpoint (/api/v1/auth)', () => {
  let server
  const userData = {
    fullname: 'client t101',
    email: 'client-t101@app.io',
    password: 'client-t101'
  }

  beforeAll(async () => {
    await dbConnect()
    await UserModel.findOneAndRemove({ email: userData.email })
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

  it('POST /signup [success]', async () => {
    const response = await supertest(server)
      .post('/api/v1/auth/signup')
      .send(userData)

    expect(response.status).toBe(201)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()
    expect(response.body.data.user).toEqual(
      expect.objectContaining({
        fullname: expect.any(String),
        email: expect.any(String),
        role: expect.any(String),
        password: expect.any(String),
        isActive: expect.any(Boolean),
        _id: expect.any(String),
        joinedAt: expect.any(String)
      })
    )
    expect(typeof response.body.data.token).toBe('string')
  })

  it('POST /login [success]', async () => {
    const response = await supertest(server)
      .post('/api/v1/auth/login')
      .send(userData)
    expect(response.status).toBe(200)
    expect(response.body).toBeTruthy()
    expect(response.body.status).toBe('success')
    expect(response.body.data).toBeTruthy()
    expect(typeof response.body.data.token).toBe('string')
  })
})
