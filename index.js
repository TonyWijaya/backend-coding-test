'use strict'

const port = 8010

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')

const buildSchemas = require('./src/schemas')

db.serialize(() => {
  buildSchemas(db)

  const app = require('./src/app')(db)

  const swaggerUi = require('swagger-ui-express')
  const openApiDocumentation = require('./docs/open_api_docs.json')

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation))

  app.listen(port, () => console.log(`App started and listening on port ${port}`))
})
