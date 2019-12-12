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

  // Testing post ride endpoint
  // '400' Bad Request scenario
  // Start coordinate validation error
  describe('POST /rides', function () {
    const data = {
      start_lat: -91, // value out of bound
      start_long: 106.816666,
      end_lat: -6.914744,
      end_long: 107.60981,
      rider_name: 'Cecep Gorbacep',
      driver_name: 'Mas Sinis',
      driver_vehicle: 'Argo Parahyangan'
    }
    it('respond with 400 Bad Request: start coordinate out of bound', function (done) {
      request(app)
        .post('/rides')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err) => {
          if (err) return done(err)
          done()
        })
    })
  })

  // Testing post ride endpoint
  // '400' Bad Request scenario
  // End coordinate validation error
  describe('POST /rides', function () {
    const data = {
      start_lat: -6.2,
      start_long: 106.816666,
      end_lat: -6.914744,
      end_long: 181, // value out of bound
      rider_name: 'Cecep Gorbacep',
      driver_name: 'Mas Sinis',
      driver_vehicle: 'Argo Parahyangan'
    }
    it('respond with 400 Bad Request: end coordinate out of bound', function (done) {
      request(app)
        .post('/rides')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err) => {
          if (err) return done(err)
          done()
        })
    })
  })

  // Testing post ride endpoint
  // '400' Bad Request scenario
  // Rider name is empty
  describe('POST /rides', function () {
    const data = {
      start_lat: -6.2,
      start_long: 106.816666,
      end_lat: -6.914744,
      end_long: 107.60981,
      rider_name: '',
      driver_name: 'Mas Sinis',
      driver_vehicle: 'Argo Parahyangan'
    }
    it('respond with 400 Bad Request: rider name is empty', function (done) {
      request(app)
        .post('/rides')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err) => {
          if (err) return done(err)
          done()
        })
    })
  })

  // Testing post ride endpoint
  // '400' Bad Request scenario
  // Driver name is empty
  describe('POST /rides', function () {
    const data = {
      start_lat: -6.2,
      start_long: 106.816666,
      end_lat: -6.914744,
      end_long: 107.60981,
      rider_name: 'Cecep Gorbacep',
      driver_name: '',
      driver_vehicle: 'Argo Parahyangan'
    }
    it('respond with 400 Bad Request: driver name is empty', function (done) {
      request(app)
        .post('/rides')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err) => {
          if (err) return done(err)
          done()
        })
    })
  })

  // Testing post ride endpoint
  // '400' Bad Request scenario
  // Driver vehicle is empty
  describe('POST /rides', function () {
    const data = {
      start_lat: -6.2,
      start_long: 106.816666,
      end_lat: -6.914744,
      end_long: 107.60981,
      rider_name: 'Cecep Gorbacep',
      driver_name: 'Mas Sinis',
      driver_vehicle: ''
    }
    it('respond with 400 Bad Request: driver vehicle is empty', function (done) {
      request(app)
        .post('/rides')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err) => {
          if (err) return done(err)
          done()
        })
    })
  })

  // Testing get all rides endpoint
  // With no query
  describe('GET /rides', () => {
    const limit = 3
    const page = 1

    it(`should GET all the rides with default page ${page} and limit ${limit}`, (done) => {
      var agent = request(app)

      const data = {
        start_lat: -6.2,
        start_long: 106.816666,
        end_lat: -6.914744,
        end_long: 107.60981,
        rider_name: 'Cecep Gorbacep',
        driver_name: 'Mas Sinis',
        driver_vehicle: 'Argo Parahyangan'
      }

      agent.post('/rides').type('json').send(data).end(function () {
        agent.post('/rides').type('json').send(data).end(function () {
          agent.post('/rides').type('json').send(data).end(function () {
            agent.post('/rides').type('json').send(data).end(function () {
              agent.get('/rides')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                  if (Number(res.body.page) !== page) throw new Error(`Default page must be ${page}`)
                  if (Number(res.body.limit) !== limit || res.body.results.length > limit) throw new Error(`Default limit must be ${limit}`)
                })
                .end(function (err) {
                  if (err) return done(err)
                  done()
                })
            })
          })
        })
      })
    })
  })

  // Testing get all rides endpoint
  // With page and limit query
  describe('GET /rides', () => {
    const limit = 2
    const page = 2

    it(`should GET all the rides with page ${page} and limit ${limit}`, (done) => {
      var agent = request(app)

      const data = {
        start_lat: -6.2,
        start_long: 106.816666,
        end_lat: -6.914744,
        end_long: 107.60981,
        rider_name: 'Cecep Gorbacep',
        driver_name: 'Mas Sinis',
        driver_vehicle: 'Argo Parahyangan'
      }

      agent.post('/rides').type('json').send(data).end(function () {
        agent.post('/rides').type('json').send(data).end(function () {
          agent.post('/rides').type('json').send(data).end(function () {
            agent.post('/rides').type('json').send(data).end(function () {
              agent.get(`/rides?page=${page}&limit=${limit}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                  if (Number(res.body.page) !== page) throw new Error(`Page must be ${page}`)
                  if (Number(res.body.limit) !== limit || res.body.results.length > limit) throw new Error(`Limit must be ${limit}`)
                })
                .end(function (err) {
                  if (err) return done(err)
                  done()
                })
            })
          })
        })
      })
    })
  })

  // Testing get rides by id endpoint
  // giving an existing ride
  describe('GET /rides/:id', () => {
    it('should response with json containing a single ride', (done) => {
      request(app)
        .get('/rides/1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err) => {
          if (err) return done(err)
          done()
        })
    })
  })

  // Testing get rides by id endpoint
  // giving a non-existing ride
  describe('GET /rides/:id', () => {
    it('should respond with 404: rider not found', (done) => {
      request(app)
        .get('/rides/999')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end((err) => {
          if (err) return done(err)
          done()
        })
    })
  })

  // Testing SQL Injection
  // give input that can retrieve all records if vulnerable to SQL injection
  describe('GET /rides/:id', () => {
    const input = '105 OR 1=1'
    it('should response with 404: Rides not found', (done) => {
      request(app)
        .get(`/rides/${input}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .expect(function (res) {
          if (res.body.length > 1) throw new Error('Vulnerable to SQL injection')
        })
        .end((err) => {
          if (err) return done(err)
          done()
        })
    })
  })
})
