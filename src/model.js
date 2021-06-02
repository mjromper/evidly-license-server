'use strict'
/* dependencies */
const config = require('../config');
const errors = require('./errors')
const utils = require('./utils');
const fs = require('fs')
const db = require('./mongo');


/*let dal

if (!config.stateless) {
  dal = require('redis-async-wrapper');
  dal.init({url: config.redis, keyPrefix: config.name})
}

const Formats = {
  key: 'LicensKey:%s'
};*/

const PrivateKey = {
  key: fs.readFileSync(config.rsa_private_key).toString(),
  passphrase: config.rsa_passphrase
}
console.log("PrivateKey", PrivateKey.key);
const PublicKey = fs.readFileSync(config.rsa_public_key).toString()
console.log("PublicKey", PublicKey);

//const LicenseKey = dal? new dal.Redis_Hash({tpl: Formats.key}) : {}
const LicenseKey = {}

LicenseKey.generateLicense = (key, machine) => {
  const license = { identity: config.identity, machine, key, meta: LicenseKey.validate(key) }
  const buf = Buffer.from(JSON.stringify(license), 'utf8')
  const _license = utils.crypt(PrivateKey, buf, true)
  return _license.toString('hex')
}

LicenseKey.authorize = async (key, machine) => {
  let lic = await db.license.getOne({"key": key});
  if ( lic.machine && lic.machine.length > 0 ){
      return 0;
  } else {
    await db.license.update(lic._id, { "machine": machine });
    return 1;
  }
  
  //return LicenseKey.hsetnx([key], 'machine', machine)
}

LicenseKey.fetch = async (key) => {
  //return LicenseKey.hgetall([key])
  return await db.license.getOne({"key": key});
}

LicenseKey.validate = (key) => {
  const buf = Buffer.from(key, 'hex')
  try {
    const _data = utils.crypt(PublicKey, buf, false)
    const data = JSON.parse(_data.toString('utf8'))
    if (data.identity === config.identity) {
      if (data.persist == 1) return data
      else if (data.startDate < Date.now() && data.endDate > Date.now()) return data
    }
    console.info(`Encountered invalid key ${_data}`)
  } catch (e) {
    console.error(e.toString())
  }
}

LicenseKey.issue = async (options={}) => {
  const meta = {
    identity: config.identity || 'Software',
    type: options.type || 'CUSTOMER',
    persist: options.persist? 1: 0,
    startDate: options.startDate || Date.now(),
    endDate: options.endDate || Date.now() + config.expireAfter,
    issueDate: Date.now()
  }
  const buf = Buffer.from(JSON.stringify(meta), 'utf8')
  const key = utils.crypt(PrivateKey, buf, true).toString('hex')
  //const data = { revoked: 0, issueDate: meta.issueDate }
  const data = { key: key, revoked: 0, issueDate: meta.issueDate }
  //if (!config.stateless) {
      //LicenseKey.hmset([key], data)
      await db.license.add(data);
  //}
  let out = {status: errors.SUCCESS.status, statusMsg:errors.SUCCESS.statusMsg, key }
  return out
}

LicenseKey.revoke = async (key) => {
  const data = LicenseKey.validate(key)
  if (!data) {
      let response = errors.INVALID_INPUT
      response.msg = `Invalid License key: ${key}`
      return response
  } else {
    //if (!config.stateless) {
        let lic = await db.license.getOne({"key": key});
        await db.license.update(lic._id, {"revoked": 1});
        //await LicenseKey.hset([key], 'revoked', 1)
    //}
  }
  return errors.SUCCESS
}



module.exports = { LicenseKey }
