'use strict'

const request = require('supertest')

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')

const app = require('../src/app')(db)
const buildSchemas = require('../src/schemas')

/** ** API Testing ***/
describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err)
      }

      buildSchemas(db)

      done()
    })
  })

  // Testing get healthiness of API endpoint
  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done)
    })
  })

  // Testing get all rides endpoint
  // Rides are empty
  describe('GET /rides', () => {
    it('should respond with 404 Bad Request: no rides found', (done) => {
      request(app)
        .get('/rides')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end((err) => {
          if (err) return done(err)
          done()
        })
    })
  })
})
