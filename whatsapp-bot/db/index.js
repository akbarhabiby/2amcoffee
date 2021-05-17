const mongoose = require('mongoose')
const model = require('./models')
const { MONGODB_URI, MONGODB_DEV_URI } = require('../config')
const [ _, __, dev ] = process.argv

const db = MONGODB_DEV_URI || MONGODB_URI ? (
  new Promise(async (resolve, reject) => {
    console.log('Connecting to database...\n')
    try {
      await mongoose.connect((dev ? MONGODB_DEV_URI : MONGODB_URI), { useNewUrlParser: true, useUnifiedTopology: true })
      resolve(console.log(`Successfully connected to ${dev ? 'development': 'production'} database, starting bot...\n`))
    } catch (e) {
      reject(new Error(`Failed to connect to ${dev ? 'development': 'production'} database`))
    }
  })
) : (
  new Promise((_, reject) => reject(new Error('Database is uninitialized!')))
)

module.exports = {
  db,
  model
}


// const admin = require('firebase-admin')
// const { GOOGLE_SERVICE_ACCOUNT } = require('../config')

// admin.initializeApp({
//   credential: admin.credential.cert(GOOGLE_SERVICE_ACCOUNT)
// })

// const db = admin.firestore()

// const docRef = {
//   order: db.collection('order'),
//   product: db.collection('product'),
//   message: db.collection('message')
// }

// module.exports = {
//   Order: class {
//     constructor({ nama, alamat, pembelian, payment }) {
//       this.nama = nama
//       this.alamat = alamat
//       this.pembelian = pembelian
//       this.payment = payment
//     }

//     save() {
//       return docRef.order.add({
//         nama: this.nama,
//         alamat: this.alamat,
//         pembelian: this.pembelian,
//         payment: this.payment
//       })
//     }

//     static get() {
//       return docRef.order.get()
//     }
//   },
//   Product: class {
//     constructor({ nama, code, harga }) {
//       this.nama = nama
//       this.code = code
//       this.harga = harga
//     }

//     save() {
//       return docRef.product.add({
//         nama: this.nama,
//         code: this.code,
//         harga: this.harga
//       })
//     }

//     static get() {
//       return docRef.product.get()
//     }
//   },
//   Message: class {
//     constructor({ key, message }) {
//       this.key = key
//       this.message = message
//     }

//     static async setup() {
//       return new Promise(async (resolve, reject) => {
//         const { empty } = await this.get()
//         if (!empty) {
//           await Promise.all([
//             docRef.message.doc('greetings').set({ message: '' }),
//             docRef.message.doc('menu').set({ message: '' }),
//             docRef.message.doc('orderFormat').set({ message: '' }),
//             docRef.message.doc('cs').set({ message: '' }),
//             docRef.message.doc('leavingCS').set({ message: '' })
//           ])
//           resolve({ message: 'Successfully setup message' })
//         } else {
//           reject({ message: 'Failed to setup message', reason: 'Message already exist!' })
//         }
//       })
//     }

//     static get() {
//       return docRef.message.get()
//     }

//     static update(key, value) {
//       return docRef.message.doc(key).update({ message: value })
//     }
//   }
// }
