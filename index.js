const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const Pino = require("pino")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session")

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    printQRInTerminal: true
  })

  if (!sock.authState.creds.registered) {
    const number = "628xxxxxxxxxx" // ganti nomor WA lu
    const code = await sock.requestPairingCode(number)
    console.log("🔑 Pairing Code:", code)
  }

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        startBot()
      } else {
        console.log("Session logout, hapus folder session")
      }
    }

    if (connection === "open") {
      console.log("✅ BOT CONNECTED")
    }
  })
}

startBot()
