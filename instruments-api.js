require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const bodyParser = require('body-parser')
const { getInstrument, addInstrument, deleteInstrument } = require('./dal')
const NodeHTTPError = require('node-http-error')
const { propOr, isEmpty, not } = require('ramda')
const checkRequiredFields = require('./lib/check-required-fields')
const pkGen = require('./lib/pk-gen')

app.use(bodyParser.json())

app.get('/', function(req, res, next) {
  res.send('Welcome to the Instruments api.')
})

app.get('/instruments/:instrumentID', function(req, res, next) {
  const instrumentID = req.params.instrumentID
  getInstrument(instrumentID, function(err, data) {
    if (err) {
      next(new NodeHTTPError(err.status, err.message, err))
      return
    }
    res.status(200).send(data)
  })
})

app.post('/instruments', function(req, res, next) {
  const newInstrument = propOr({}, 'body', req)

  if (isEmpty(newInstrument)) {
    next(new NodeHTTPError(400, 'missing instrument in body.'))
    return
  }

  const missingFields = checkRequiredFields(
    ['name', 'category', 'group', 'retailPrice', 'manufacturer'],
    newInstrument
  )

  console.log('not isEmpty missingFeilds', not(isEmpty(missingFields)))
  if (not(isEmpty(missingFields))) {
    next(new NodeHTTPError(400, `missing field(s) in body`))
    return
  }

  // TODO: Check required
  // TODO: Pick required

  addInstrument(newInstrument, function(err, data) {
    if (err) {
      next(
        new NodeHTTPError(err.status, err.message, { max: 'is the coolest' })
      )
    }
    res.status(201).send(data)
  })
})

app.put('./instruments/:instrumentID', function(req, res, next) {
  const instrument = req.body
  updateInstrument(instrument, function(err, success) {
    if (err) {
      next(new NodeHTTPError(err.status, err.message, err))
      return
    }
    res.status(200).send(success)
  })
})

app.delete('/instruments/:instrumentID', function(req, res, next) {
  const instrumentID = req.params.instrumentID

  deleteInstrument(instrumentID, function(err, data) {
    if (err) {
      next(new NodeHTTPError(err.status, err.message, err))
    }
    res.status(200).send(data)
  })
})

app.use(function(err, req, res, next) {
  console.log(
    'ERROR! ',
    'METHOD: ',
    req.method,
    ' PATH',
    req.path,
    ' error:',
    JSON.stringify(err)
  )
  res.status(err.status || 500)
  res.send(err)
})

app.listen(port, () => console.log('API is up', port))
