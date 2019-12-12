'use strict'

const express = require('express')
const app = express()
const log = require('../config/winston')

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

const INTERNAL_SERVER_ERROR = 500
const BAD_REQUEST = 400
const NOT_FOUND = 404

module.exports = (db) => {
  app.get('/health', (req, res) => res.send('Healthy'))

  app.post('/rides', jsonParser, async (req, res) => {
    const endpoint = '/POST rides'
    log.info(`Hitting endpoint: ${endpoint}`)

    const startLatitude = Number(req.body.start_lat)
    const startLongitude = Number(req.body.start_long)
    const endLatitude = Number(req.body.end_lat)
    const endLongitude = Number(req.body.end_long)
    const riderName = req.body.rider_name
    const driverName = req.body.driver_name
    const driverVehicle = req.body.driver_vehicle

    if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
      const errorCode = 'VALIDATION_ERROR'
      const message = 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
      const statusCode = BAD_REQUEST

      log.error(`${statusCode} - ${errorCode} - ${endpoint} - ${message}`)

      return res.status(statusCode).send({
        error_code: errorCode,
        message: message
      })
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      const errorCode = 'VALIDATION_ERROR'
      const message = 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
      const statusCode = BAD_REQUEST

      log.error(`${statusCode} - ${errorCode} - ${endpoint} - ${message}`)

      return res.status(statusCode).send({
        error_code: errorCode,
        message: message
      })
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      const errorCode = 'VALIDATION_ERROR'
      const message = 'Rider name must be a non empty string'
      const statusCode = BAD_REQUEST

      log.error(`${statusCode} - ${errorCode} - ${endpoint} - ${message}`)

      return res.status(400).send({
        error_code: errorCode,
        message: message
      })
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      const errorCode = 'VALIDATION_ERROR'
      const message = 'Driver name must be a non empty string'
      const statusCode = BAD_REQUEST

      log.error(`${statusCode} - ${errorCode} - ${endpoint} - ${message}`)

      return res.status(400).send({
        error_code: errorCode,
        message: message
      })
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      const errorCode = 'VALIDATION_ERROR'
      const message = 'Driver vehicle must be a non empty string'
      const statusCode = BAD_REQUEST

      log.error(`${statusCode} - ${errorCode} - ${endpoint} - ${message}`)

      return res.status(400).send({
        error_code: errorCode,
        message: message
      })
    }

    var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle]
    try {
      await db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values)
      var rows = await db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID)

      res.send(rows)
    } catch (err) {
      const errorCode = 'SERVER_ERROR'
      const message = 'Unknown Error'
      const statusCode = INTERNAL_SERVER_ERROR

      log.error(`${statusCode} - ${errorCode} - ${endpoint} - ${err}`)
      return res.status(statusCode).send({
        error_code: errorCode,
        message: message
      })
    }
  })

  app.get('/rides', async (req, res) => {
    const endpoint = '/GET rides'
    log.info(`Hitting endpoint: ${endpoint}`)

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 3

    const offset = (page - 1) * limit

    db.all(`SELECT * FROM Rides LIMIT ${offset},${limit}`, function (err, rows) {
      if (err) {
        const errorCode = 'SERVER_ERROR'
        const message = 'Unknown Error'
        const statusCode = 500

        log.error(`${statusCode} - ${errorCode} - ${endpoint} - ${message}`)
        return res.send({
          error_code: errorCode,
          message: message
        })
      }

      console.log(rows.length)
      if (rows.length === 0) {
        const errorCode = 'RIDES_NOT_FOUND_ERROR'
        const message = 'Could not find any rides'
        const statusCode = 500

        log.error(`${statusCode} - ${errorCode} - ${endpoint} - ${message}`)

        return res.status(404).send({
          error_code: errorCode,
          message: message
        })
      }

      var response = {
        page: page,
        limit: limit,
        results: rows
      }

      res.send(response)
    })
  })

  app.get('/rides/:id', (req, res) => {
    const endpoint = '/GET rides/:id'
    log.info(`Hitting endpoint: ${endpoint}`)

    db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
      if (err) {
        const errorCode = 'SERVER_ERROR'
        const message = 'Unknown Error'
        const statusCode = INTERNAL_SERVER_ERROR

        log.error(`${statusCode} - ${errorCode} - ${endpoint} - ${message}`)

        return res.status(statusCode).send({
          error_code: errorCode,
          message: message
        })
      }

      if (rows.length === 0) {
        const errorCode = 'RIDES_NOT_FOUND_ERROR'
        const message = 'Could not find any rides'
        const statusCode = NOT_FOUND

        log.error(`${statusCode} - ${errorCode} - ${endpoint} - ${message}`)
        return res.status(statusCode).send({
          error_code: errorCode,
          message: message
        })
      }

      res.send(rows)
    })
  })

  return app
}
