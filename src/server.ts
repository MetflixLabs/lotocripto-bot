import 'dotenv/config'
import { server } from './app'

const port = process.env.PORT

const startServer = async () => (await server()).listen(port)

startServer()
