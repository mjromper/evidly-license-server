'use strict'
const express = require('express')
const router = express.Router()
const config = require('../config')
const utils = require('./utils')
const model = require('./model')
const errors = require('./errors')

class Handler {
  async handleLicense(req, res) {
    if (!utils.attrsNotNull(req.body, ['key', 'id'])) return res.json(errors.BAD_REQUEST)
    const {key, id:machine} = req.body
    console.log(`Validating key: ${key}`)
    console.log(`With machine: ${machine}`)

    const data = model.LicenseKey.validate(key)
    if (!data) {
      let response = errors.INVALID_INPUT
      response.msg = `Invalid License key: ${key}`

      console.log(`Invalid License key: ${key}`)

      return res.json(response)
    }

    console.log("Key Data:", data);

    //if (!config.stateless) {
      const licenseKey = await model.LicenseKey.fetch(key)

      console.log(`License Key:`, licenseKey)

      if (!licenseKey || licenseKey.revoked == 1) {
        let response = errors.NULL_DATA
        response.msg = `Failed to check the license key in databases: ${key}`
        if ( licenseKey ) {
          let revoked = (licenseKey.revoked == 1)? 1 : 0
          response.msg += `, revoked: ${revoked}`
        } 
        console.log("Error:", response.msg)
        return res.json(response)
      }
      
      let success = await model.LicenseKey.authorize(key, machine)
      if (licenseKey.machine === machine) {
          success = true
      }
      if (!success) {
        let response = errors.DUPLICATE_DATA
        response.msg = `Used key encountered: ${key}, machine: ${machine}`
        console.log("Error:", response.msg)
        return res.json(response)
      }
    //}
    const license = model.LicenseKey.generateLicense(key, machine)

    console.log(`Key is VALID, corresponding License: ${license}`)
    
    return res.json({status: errors.SUCCESS.status, statusMsg: errors.SUCCESS.statusMsg, license})
  }

  async issue(req, res) {
    let options = req.body || {}
    console.log("Issueing a new Key for options", options)
    let key = await model.LicenseKey.issue(options)
    console.log("New key issued: ", key)
    res.json(key);
  }

  async revoke(req, res) {
    let body = req.body || {}
    let key = body.key;
    if (!key){
      res.json(errors.INVALID_INPUT)
    } else {
      var response = await model.LicenseKey.revoke(key)
      res.json(response)
    }
    
  }
}

const handler = new Handler

router.post('/issuekey', handler.issue.bind(handler))
router.post('/license', handler.handleLicense.bind(handler))
router.post('/revoke', handler.revoke.bind(handler))

module.exports = { router, handler }
