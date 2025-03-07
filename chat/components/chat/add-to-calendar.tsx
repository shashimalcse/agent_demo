import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface AddToCalendarProps {
    authorizationUrl: string;
    onAddToCalendar: () => void;
    onSkipCalendar: () => void;
    threadId: string;
}

export function AddToCalendar({ threadId, authorizationUrl, onAddToCalendar, onSkipCalendar }: AddToCalendarProps) {
    const [hasClicked, setHasClicked] = useState(false);

    const handleAuthorize = () => {
        window.open(authorizationUrl, '_blank', 'noopener,noreferrer');
        setHasClicked(true);

        let attempts = 0;
        const maxAttempts = 12; // 12 attempts for 1 minute (5 seconds interval)
        const intervalId = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                clearInterval(intervalId);
                console.error('Authorization check timed out');
                return;
            }

            try {
                const response = await fetch(`http://localhost:8000/state/${threadId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const states = data.states;
                    console.log(states)
                    if (states.includes('CALENDAR_AUTORIZED')) {
                        clearInterval(intervalId);
                        onAddToCalendar();
                    }
                } else {
                    console.error('Failed to complete authorization');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }, 5000); // Call every 5 seconds
    }

    return (
        !hasClicked ? (<div className="mt-4 flex flex-col gap-2">
            <Card className="w-full mt-4">

                <CardContent>
                    {
                        <div className="flex flex-col space-y-2">
                            <p className="text-sm text-gray-600 mb-2 mt-4">
                                Add your booking to Google Calendar to keep track of your stay.
                            </p>
                            <div className="flex flex-row space-x-2">
                                <Button
                                    onClick={onSkipCalendar}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Skip
                                </Button>
                                <Button
                                    onClick={handleAuthorize}
                                    className="w-full bg-orange-500 hover:bg-orange-600"
                                >
                                    Connect to Calendar
                                </Button>
                            </div>
                        </div>
                    }
                </CardContent>
            </Card>
        </div>) : (<div></div>)

    )
}
