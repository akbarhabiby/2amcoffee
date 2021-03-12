const server = require('venom-bot')
const { db } = require('./db')

// * Temporary
const exDB = {
  greetings: `Halo Selamat Sore. Saya asisten pelayanan pelanggan di 2AMCoffee.\n\nKetik *Menu* untuk melihat daftar Menu, ketik *CS* untuk berbicara langsung dengan Admin`,
  menu: `Ini daftar menu dari kami:\n1. Apalah\n2.Itulah\n3. Bagaimana\n\nKetik *Order*`,
  orderFormat: `*ORDER*\nNama: <nama kamu>\nAlamat: <alamat kamu>\nPayment: <TRANSFER / COD>`
}

async function main() {
  const bot = await server.create('service')
  let userTempData = {}

  setInterval(() => {
    userTempData = {}
    console.log('alive');
  }, 180000)

  bot.onMessage(async ({ sender: { id: senderId }, body: message , timestamp, isGroupMsg }) => {
    // * [message = "Hello World"], [sender = { id: '6281318356925@c.us' }], [timestamp = 1615438700], [isGroupMsg = false]

    const setUserStep = (step) => userTempData[senderId]['step'] = step

    console.log('Siapa saja yg order?', userTempData)

    if (!isGroupMsg) {
      const userMessage = message.toLowerCase()
      const [date, fullTime] = new Date(timestamp * 1000).toLocaleString('id-ID').split(' ') // * [Date = "11/3/2021"], [fullTime = "11/3/2021 12.16.23"] (string)
      const [hour, minute, second] = fullTime.split('.') // * [hour = "12"], [minute = "45"], [second = "18"] (string)

      if (!userTempData[senderId]) { // * First Chat (no step)
        userTempData[senderId] = {}
        setUserStep(0)
        await bot.sendText(senderId, exDB.greetings)
      } else if (userTempData[senderId]['step'] === 0) {
        if (userMessage === 'menu') {
          setUserStep(1)
          const payload = {
            senderId,
            content: exDB.menu
          }
          await bot.sendText(payload.senderId, payload.content)
        } else {
          await bot.sendText(senderId, exDB.greetings)
        }
      } else if (userTempData[senderId]['step'] === 1) { // * Menu
        if (userMessage === 'order') {
          setUserStep(2)
          const payload = {
            senderId,
            content: exDB.orderFormat
          }
          await bot.sendText(payload.senderId, payload.content)
        } else {
          await bot.sendText(senderId, exDB.menu)
        }
      } else if (userTempData[senderId]['step'] === 2) { // * Order
        if (userMessage.split('\n')[0] === '*order*' || userMessage.split('\n')[0] === 'order') {
          setUserStep(3)
          const userData = {}
          let singleUserInputMessage = ''
  
          message.split('\n').forEach((element, index) => {
            if (index > 0 && element) {
              if(element == '==') {
                const [inputFormat, userInput] = singleUserInputMessage.split(':')
                const inputFormatKey = inputFormat.toLowerCase().substring(1)
                if (!userData[inputFormatKey]) userData[inputFormatKey] = userInput.substring(1)
                singleUserInputMessage = ''
              } else {
                singleUserInputMessage += ` ${element}`
              }
            }
          })
  
          const [ buyerName ] = userData.nama.toLowerCase().split(' ')
  
          const payload = {
            senderId,
            content: `Halo kak *${buyerName[0].toUpperCase() + buyerName.substring(1)}*!\n\nAlamat kakak di ${userData.alamat}\n\nApakah sudah benar?`
          }
  
          await bot.sendText(payload.senderId, payload.content)
        } else {
          const payload = {
            senderId,
            content: exDB.orderFormat
          }
          await bot.sendText(payload.senderId, payload.content)
        }
      } else if (userTempData[senderId]['step'] === 3) {
        if (userMessage === 'benar') {
          const payload = {
            senderId,
            content: `Terima kasih kak, orderan sudah kami proses yaa (save to DB)`
          }
          await bot.sendText(payload.senderId, payload.content)
        } else if (userMessage === 'salah') {
          setUserStep(2)
          const payload = {
            senderId,
            content: `Jangan khawatir kak, silahkan perbaiki data kakak`
          }
          await bot.sendText(payload.senderId, payload.content)
        } else {
          const payload = {
            senderId,
            content: 'Oopsss... Input kamu salah, berikut adalah input yang valid'
          }
          await bot.sendText(payload.senderId, payload.content)
        }
      }
    }
  })
}

db.then(main).catch(console.error)
