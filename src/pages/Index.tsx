
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, FileText, CheckCircle, Palette } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Earlyjobs Franchise Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to the Earlyjobs franchise management system. Complete your franchise activation process with our comprehensive forms.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
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
                <FileText className="h-5 w-5 text-blue-600" />
                Activation Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Complete your franchise activation confirmation form to proceed with launch.
              </p>
              <Link to="/earlyjobs/franchise-activation-form">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Activation Form
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Launch Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get comprehensive support during your franchise launch process.
              </p>
              <div className="text-sm text-gray-500 mb-4">
                ✓ Pre-launch consultation<br/>
                ✓ Training modules<br/>
                ✓ Ongoing support
              </div>
              <Link to="/earlyjobs/branding-form">
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Palette className="h-4 w-4 mr-2" />
                  Branding Form
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Launch Your Franchise?
              </h2>
              <p className="text-gray-600 mb-6">
                Complete the franchise activation form at least 7 days before your planned launch date. 
                This ensures all requirements are met and your franchise is ready for a successful opening.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/earlyjobs/franchise-activation-form">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                    Complete Activation Form
                  </Button>
                </Link>
                <Link to="/earlyjobs/branding-form">
                  <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
                    <Palette className="h-4 w-4 mr-2" />
                    Branding Form
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
