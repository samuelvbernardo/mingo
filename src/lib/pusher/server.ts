import PusherServer from "pusher"

let pusherServerInstance: PusherServer | null = null

export function getPusherServer() {
  if (!pusherServerInstance) {
    pusherServerInstance = new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    })
  }

  return pusherServerInstance
}

export const pusherServer = getPusherServer()
