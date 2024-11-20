import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {useNavigate, useRouter} from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';

export const CustomErrorComponent = ({ errorMessage = 'An unexpected error occurred.' }) => {
    const navigate = useNavigate();
    const router = useRouter();

    const handleHomeClick = async () => {
        await navigate({to: '/'});
    };

    const handleBackClick = () => {
        router.history.back()
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center bg-gray-200 py-6">
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="text-red-500" size={48} />
                    </div>
                    <CardTitle className="text-2xl text-red-600">Error</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                    <p className="text-gray-700 mb-6">{errorMessage}</p>
                    <div className="flex justify-center gap-4">
                        <Button
                            variant="outline"
                            onClick={handleBackClick}
                            className="w-full"
                        >
                            Go Back
                        </Button>
                        <Button
                            onClick={handleHomeClick}
                            className="w-full"
                        >
                            Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
