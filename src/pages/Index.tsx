
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, FileText, CheckCircle, Palette } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className='text-center' style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
      <img src ="/early-jobs-logo.png" style={{height: "150px", width: "150px" , marginLeft:"10px"}}/>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Earlyjobs Franchise | Complete Your Franchise Activation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Welcome to the Earlyjobs Franchise Management System. Easily complete your franchise activation process with our secure, step-by-step forms
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-orange-600" />
                Franchise Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get your franchise location ready with our comprehensive setup checklist.
              </p>
              <div className="text-sm text-gray-500">
                ✓ Office readiness verification<br/>
                ✓ Infrastructure checklist<br/>
                ✓ Documentation requirements
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Activation Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Complete your franchise activation confirmation form to proceed with launch.
              </p>
              <Link to="/earlyjobs/franchise-activation-form">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Start Activation Form
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                Branding Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
               Complete your franchise activation confirmation form to proceed with launch.
              </p>
              <Link to="/earlyjobs/branding-form">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Start Branding Form
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        
      </div>
    </div>
  );
};

export default Index;
