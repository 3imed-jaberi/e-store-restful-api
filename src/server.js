import '#app/config/env-loader.js'
import '#app/config/db-connect.js'

import http from 'node:http'

import { app } from './app.js'

const server = http.createServer(app)

const PORT = process.env.PORT || 3000
server.listen(
  PORT,
  console.log(
    `⚡️ Server running in ${process.env.NODE_ENV} mode at http://localhost:${PORT}/api/v1`
  )
)

// handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`🛑 Error: ${err.message}`)
  // close server & exit process
  // server.close(() => process.exit(1));
})
