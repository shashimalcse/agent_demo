interface LoadingIndicatorProps {
  action?: 'searching' | 'booking' | 'default'
}

export function LoadingIndicator({ action = 'default' }: LoadingIndicatorProps) {
  const getMessage = () => {
    switch (action) {
      case 'searching':
        return 'Searching for available rooms...'
      case 'booking':
        return 'Processing your booking request...'
      default:
        return 'Thinking...'
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{getMessage()}</p>
      <div className="flex space-x-2">
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
      </div>
    </div>
  )
}
