import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";

interface AddToCalendarProps {
    authorizationUrl: string;
    onAddToCalendar: () => void;
    onSkipCalendar: () => void;
}

export function AddToCalendar({ authorizationUrl, onAddToCalendar, onSkipCalendar }: AddToCalendarProps) {
    const [hasClicked, setHasClicked] = useState(false);

    const handleAuthorize = () => {
        window.open(authorizationUrl, '_blank', 'noopener,noreferrer');
        setHasClicked(true);
    }

    return (
        <div className="mt-4 flex flex-col gap-2">
            <Card className="w-full mt-4">
                <CardHeader>
                    <CardTitle className="text-xl font-serif">Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    {
                        hasClicked ? (
                            <div className="flex flex-col space-y-2">
                                <Button
                                    onClick={onAddToCalendar}
                                    className="w-full bg-orange-500 hover:bg-orange-600"
                                >
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Add to Calendar
                                </Button>
                                <Button
                                    onClick={onSkipCalendar}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <XIcon className="mr-2 h-4 w-4" />
                                    Skip
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2">
                                <p className="text-sm text-gray-600 mb-2">
                                    Add your booking to Google Calendar to keep track of your stay.
                                </p>
                                <Button
                                    onClick={handleAuthorize}
                                    className="w-full bg-orange-500 hover:bg-orange-600"
                                >
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Connect to Calendar
                                </Button>
                                <Button
                                    onClick={onSkipCalendar}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <XIcon className="mr-2 h-4 w-4" />
                                    Skip
                                </Button>
                            </div>
                        )
                    }
                </CardContent>
            </Card>
        </div>
    )
}
