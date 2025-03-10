interface LoadingIndicatorProps {
  action?: 'searching' | 'booking' | 'default' | 'add_to_calendar'
}

export function LoadingIndicator({ action = 'default' }: LoadingIndicatorProps) {
  const getMessage = () => {
    switch (action) {
      case 'searching':
        return 'Searching for available rooms...'
      case 'booking':
        return 'Processing your booking request...'
      case 'add_to_calendar':
        return 'Adding to your calendar...'
      default:
        return 'Thinking...'
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 font-medium">{getMessage()}</p>
      <div className="flex space-x-1.5">
        <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500 opacity-75 [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500 opacity-75 [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500 opacity-75"></div>
      </div>
    </div>
  )
}
