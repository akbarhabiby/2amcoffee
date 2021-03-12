const mongoose = require('mongoose')
const { MONGODB_URI, MONGODB_DEV_URI } = require('../config')
const [ _, __, dev ] = process.argv

const db = MONGODB_DEV_URI || MONGODB_URI ? (
  new Promise(async (resolve, reject) => {
    console.log('Connecting to database...\n')
    try {
      await mongoose.connect((dev ? MONGODB_DEV_URI : MONGODB_URI), { useNewUrlParser: true, useUnifiedTopology: true })
      resolve(console.log(`Successfully connected to ${dev ? 'development': 'production'} database, starting bot...\n`))
    } catch (e) {
      reject(new Error('Failed to connect to database'))
    }
  })
) : (
  new Promise((_, reject) => reject(new Error('Database is uninitialized!')))
)

module.exports = {
  mongoose,
  db
}
