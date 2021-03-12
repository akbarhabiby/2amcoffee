const { mongoose } = require('./index')
const { menuSchema, transactionSchema } = require('./schema')

module.exports = {
  Menu: mongoose.model('Menu', menuSchema),
  Transaction: mongoose.model('Transaction', transactionSchema)
}
