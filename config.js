'use strict'

const path = require('path')

module.exports = {
  name: process.env.SERVER_NAME || 'evidly-license-server',
  identity: process.env.SERVER_INDENTITY || 'Evidly',     
  //stateless: false,
  mongouri: process.env.MONGO_URI,
  expireAfter: 365*24*60*60*1000,
  rsa_private_key: path.join(__dirname, "private.pem"),
  rsa_public_key: path.join(__dirname, "public.pem"),
  rsa_passphrase: process.env.RSA_PASSPHRASE || 'passphrase'
}