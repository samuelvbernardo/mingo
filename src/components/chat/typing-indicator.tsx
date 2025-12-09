"use client"

interface TypingIndicatorProps {
  userNames: string[]
}

export function TypingIndicator({ userNames }: TypingIndicatorProps) {
  if (userNames.length === 0) return null

  const displayText =
    userNames.length === 1
      ? `${userNames[0]} está digitando...`
      : userNames.length === 2
        ? `${userNames[0]} e ${userNames[1]} estão digitando...`
        : `${userNames[0]} e mais ${userNames.length - 1} estão digitando...`

  return (
    <div className="px-4 py-2 text-sm text-muted-foreground border-t bg-muted/30">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        </div>
        <span>{displayText}</span>
      </div>
    </div>
  )
}
