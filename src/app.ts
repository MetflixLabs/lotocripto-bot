import express from 'express'
import { Server as socketio } from 'socket.io'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import { sockets } from './sockets'

export const server = async (): Promise<http.Server> => {
  try {
    const app = express()

    Sentry.init({
      dsn: process.env.SENTRY_KEY,
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app })
      ],

      // We recommend adjusting this value in production, or using tracesSampler
      // for finer control
      tracesSampleRate: 0.5
    })

    // RequestHandler creates a separate execution context using domains, so that every
    // transaction/span/breadcrumb is attached to its own Hub instance
    app.use(Sentry.Handlers.requestHandler())
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler())

    const server = http.createServer(app)
    const path = process.env.SOCKETIO_PATH
    const io = new socketio({
      path,
      cors: {
        origin: ['https://lotocripto.com.br'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      allowEIO3: true
    }).listen(server)

    sockets(io)

    app.use(cors())
    app.use(helmet())
    app.use(express.json())

    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler())

    return server
  } catch (error) {
    throw new Error(error.message)
  }
}
