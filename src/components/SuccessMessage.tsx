
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SuccessMessageProps {
  onNewForm: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ onNewForm }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600 mb-6">
            Your franchise activation form has been successfully submitted.
          </p>
          <Button onClick={onNewForm} className="w-full">
            Submit Another Form
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessMessage;
