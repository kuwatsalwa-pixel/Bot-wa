const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")
const Pino = require("pino")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    printQRInTerminal: true, // WAJIB true untuk login pertama
    browser: ["Bot WA", "Chrome", "1.0.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log("Disconnect reason:", reason)

      if (reason !== DisconnectReason.loggedOut) {
        console.log("Reconnect...")
        startBot()
      } else {
        console.log("Session logout, hapus folder auth lalu login ulang")
      }
    }

    if (connection === "open") {
      console.log("✅ BOT CONNECTED")
    }
  })
}

startBot()
