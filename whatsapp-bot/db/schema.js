const { mongoose: { Schema } } = require('./index')

const menuSchema = new Schema({
  name: String
})

const transactionSchema = new Schema({
  buyerName: String,
  whatsappNumber: String,
  address: String,
  item: String,
  paymentMethod: String
})

module.exports = {
  menuSchema,
  transactionSchema
}
