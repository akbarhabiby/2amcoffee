const server = require('venom-bot')
const { db } = require('./db')

async function main() {
  const bot = await server.create('service')
  let userTemp = {}

  setInterval(() => {
    userTemp = {}
    console.log('alive');
  }, 5000)

  bot.onMessage(async ({ sender: { id: senderId }, body: message , timestamp, isGroupMsg }) => {
    // * [message = "Hello World"], [sender = { id: '6281318356925@c.us' }], [timestamp = 1615438700], [isGroupMsg = false]
    if (!isGroupMsg) {
      const userMessage = message.toLowerCase()
      const [date, fullTime] = new Date(timestamp * 1000).toLocaleString('id-ID').split(' ') // * [Date = "11/3/2021"], [fullTime = "11/3/2021 12.16.23"] (string)
      const [hour, minute, second] = fullTime.split('.') // * [hour = "12"], [minute = "45"], [second = "18"] (string)

      if (userMessage === 'menu') {
        const payload = {
          senderId,
          content: `Menu yang tersedia\n1. Apalah\n2. Itulah`
        }

        await bot.sendText(payload.senderId, payload.content)
      } else if (userMessage === 'order') {
        const payload = {
          senderId,
          content: `*ORDER*\n\nNama: <nama kamu>\nAlamat: <alamat kamu>\nPayment: <TRANSFER / COD>`
        }

        await bot.sendText(payload.senderId, payload.content)
      } else if (userMessage.split('\n')[0] === '*order*' || userMessage.split('\n')[0] === 'order') {
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
          content: `Halo kak *${buyerName[0].toUpperCase() + buyerName.substring(1)}*!\n\nAlamat kakak di ${userData.alamat}\n\nSedang kami proses yaa! Terima kasih`
        }

        await bot.sendText(payload.senderId, payload.content)
      } else {
        console.log('User mengirimkan text yang tidak dikenal')
        bot.sendText(senderId, 'Oopss maaf input tidak dikenal')
      }
    }
  })
}

db.then(main).catch(console.error)
