const { model } = require('mongoose')
const { menuSchema, transactionSchema } = require('./schemas')

module.exports = {
  Menu: model('Menu', menuSchema),
  Transaction: model('Transaction', transactionSchema)
}

