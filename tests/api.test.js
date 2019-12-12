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

  // Testing post ride endpoint
  // '200' OK scenario
  describe('POST /rides', function () {
    const data = {
      start_lat: -6.2,
      start_long: 106.816666,
      end_lat: -6.914744,
      end_long: 107.60981,
      rider_name: 'Cecep Gorbacep',
      driver_name: 'Mas Sinis',
      driver_vehicle: 'Argo Parahyangan'
    }
    it('respond with 200 OK: Rides created', function (done) {
      request(app)
        .post('/rides')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err) => {
          if (err) return done(err)
          done()
        })
    })
  })
})
