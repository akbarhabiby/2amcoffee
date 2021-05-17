const server = require('venom-bot')
const { db, model: { Menu } } = require('./db')
const { WHATSAPP_CS_ID } = require('./config')

// * Temporary
const exDB = {
  greetings: `Halo Selamat Sore. Saya asisten pelayanan pelanggan di 2AMCoffee.\n\nKetik *Menu* untuk melihat daftar Menu, ketik *CS* untuk berbicara langsung dengan Admin`,
  menu: `Ini daftar menu dari kami:\n1. Apalah\n2.Itulah\n3. Bagaimana\n\nKetik *Order*`,
  orderFormat: `*ORDER*\nNama: <nama kamu>\nAlamat: <alamat kamu>\nPayment: <TRANSFER / COD>`,
  cs: `Kamu sedang berbicara dengan CS, untuk kembali melanjutkan order Ketik *CSX*`,
  leavingCS: `Terima kasih atas waktunya, semoga harimu menyenangkan!`
}

async function main() {
  const bot = await server.create('service')
  let userTempData = {}

  setInterval(() => {
    userTempData = {}
    console.log('alive');
  }, 360000)

  bot.onMessage(async (body) => {
    const { from: senderId, body: message , timestamp, isGroupMsg, quotedMsgObj } = body
    
    const userMessage = message.toLowerCase()
    // * [message = "Hello World"], [sender = { id: '6281318356925@c.us' }], [timestamp = 1615438700], [isGroupMsg = false]

    const setUserStep = (step) => userTempData[senderId]['step'] = step
    const setUserCS = (set = true) => userTempData[senderId]['chatWithCS'] = set
    const setUserData = (objUserData) => userTempData[senderId]['userData'] = objUserData

    if (!isGroupMsg) {
      const [date, fullTime] = new Date(timestamp * 1000).toLocaleString('id-ID').split(' ') // * [Date = "11/3/2021"], [fullTime = "11/3/2021 12.16.23"] (string)
      const [hour, minute, second] = fullTime.split('.') // * [hour = "12"], [minute = "45"], [second = "18"] (string)

      // * ON DEV MSG
      await bot.sendText(senderId, '*WhatsApp BOT Development on Progress*')

      if (!userTempData[senderId]) { // * First Chat (no step)
        userTempData[senderId] = {}
        setUserStep(0)
        await bot.sendText(senderId, exDB.greetings)
      } else if (userTempData[senderId]['chatWithCS']) {
        if (userMessage === 'csx') {
          setUserCS(false)
          await bot.sendText(senderId, exDB.leavingCS)
        } else {
          await bot.sendText(WHATSAPP_CS_ID, `*Dari*: wa.me/${senderId.split('@')[0]}\n*Pesan*:\n${message}`)
        }
      } else if (userTempData[senderId]['step'] === 0) {
        if (userMessage === 'menu') {
          setUserStep(1)
          const payload = {
            senderId,
            content: exDB.menu
          }
          await bot.sendText(payload.senderId, payload.content)
        } else if (userMessage === 'cs') {
          setUserCS()
          await bot.sendText(senderId, exDB.cs)
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
            console.log(element);
            if (index > 0 && element) {
              if(element == '==') {
                const [inputFormat, userInput] = singleUserInputMessage.split(':')
                const inputFormatKey = inputFormat.toLowerCase().substring(1)
                if (!userData[inputFormatKey]) userData[inputFormatKey] = userInput[0] == ' ' ? userInput.substring(1) : userInput
                singleUserInputMessage = ''
              } else {
                singleUserInputMessage += ` ${element}`
              }
            }
          })


          setUserData(userData)
          console.log(userData);
  
          const [ buyerName ] = userData.nama.toLowerCase().split(' ')
  
          const payload = {
            senderId,
            content: `Halo kak *${buyerName[0].toUpperCase() + buyerName.substring(1)}*!\n\nAlamat kakak di ${userData.alamat}\n\nApakah sudah benar?\n*BENAR* atau *SALAH*`
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
            content: 'Oopsss... Input kamu salah, input yang valid adalah *BENAR*\natau\n*SALAH*'
          }
          await bot.sendText(payload.senderId, payload.content)
        }
      }
    // * CUSTOMER SERVICE
    } else if (senderId === WHATSAPP_CS_ID) {
      if (quotedMsgObj?.body.split(':')[1]) {
        await bot.sendText(`${quotedMsgObj.body.split(':')[1].split('\n')[0].split('/')[1]}@c.us`, message)
      } else if (message === '/menu') {
        const menus = await Menu.find()
        if (!menus.length) {
          await bot.sendText(WHATSAPP_CS_ID, '*Oopsss..* Your menus is empty')
        } else {
          let result = '*Menus*\n'
          menus.forEach(menu => {
            console.log(menu)
          })
        }
        
        // ! DEVELOPMENT
        console.log(menus, 'List menus')
      } else if (message.split('\n')[0] === '/menu:add') {
        const menuData = {}

        message.split('\n').forEach((element, index) => {
          if (index > 0 && element) {
            const [inputFormat, userInput] = element.split(':')
            if (userInput) {
              menuData[inputFormat] = userInput.substring(1)
            }
          }
        })

        const { name, code, price } = menuData
        if (name && code && price) {
          await new Menu(menuData).save()
          await bot.sendText(WHATSAPP_CS_ID, )
        } else {
          await bot.sendText(WHATSAPP_CS_ID, 'Cannot save to database, please check your input!')
        }

        console.log(menuData);
      } else if (message === '/history') { // * Check History
        await bot.sendText(WHATSAPP_CS_ID, 'Today History Orders')
      } else if (message === '/pending') {
        await bot.sendText(WHATSAPP_CS_ID, 'Today Pending Orders')
      } else if (message === '/message') {

      } else {
        console.log(message);
        await bot.sendText(WHATSAPP_CS_ID, `*Command not found!*\nHere is a list of commands:\n\n/menu\nhistory\n/pending`)
      }
    }
  })
}

db.then(main).catch(console.error)
