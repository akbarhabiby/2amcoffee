const { Schema } = require('mongoose')

const menuSchema = new Schema({
  name: {
    type: String
  },
  code: {
    type: String
  },
  price: {
    type: Number
  }
}, { timestamps: true })

const transactionSchema = new Schema({
  name: {
    type: String
  },
  address: {
    type: String
  },
  product: [
    {
      type: Schema.Types.ObjectId, ref: 'Menu'
    }
  ],
  payment: {
    type: String
  }
}, { timestamps: true })

module.exports = {
  menuSchema,
  transactionSchema
}
