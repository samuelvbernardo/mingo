"use client"

import { useEffect, useState } from "react"
import { getPusherClient } from "@/lib/pusher/client"
import type { Channel } from "pusher-js"

export function usePusher(channelName: string) {
  const [channel, setChannel] = useState<Channel | null>(null)

  useEffect(() => {
    const pusher = getPusherClient()
    const pusherChannel = pusher.subscribe(channelName)

    setChannel(pusherChannel)

    return () => {
      pusherChannel.unsubscribe()
    }
  }, [channelName])

  return channel
}
