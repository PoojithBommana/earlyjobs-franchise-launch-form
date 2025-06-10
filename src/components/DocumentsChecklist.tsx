
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { FormData } from '@/types/franchise-form';
import { documentsList, documentKeyMap } from '@/constants/franchise-form';
import { openPicker } from '@/utils/google-picker';
import { useToast } from '@/hooks/use-toast';

interface DocumentsChecklistProps {
  form: UseFormReturn<FormData>;
}

const DocumentsChecklist: React.FC<DocumentsChecklistProps> = ({ form }) => {
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Section D: Documents Checklist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-xs">
            <thead>
              <tr>
                <th className="border px-2 py-1">Document</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Google Drive Link</th>
              </tr>
            </thead>
            <tbody>
              {documentsList.map((doc) => {
                const schemaKey = documentKeyMap[doc.key];
                return (
                  <tr key={doc.key}>
                    <td className="border px-2 py-1">{doc.label}</td>
                    <td className="border px-2 py-1">
                      <FormField
                        control={form.control}
                        name={`documents.${schemaKey}.status`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  if (value === 'submitted') {
                                    form.setValue(`documents.${schemaKey}.driveLink`, '');
                                  }
                                }}
                                value={field.value}
                                className="flex justify-center space-x-4"
                              >
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="submitted" id={`${doc.key}-submitted`} />
                                  <Label htmlFor={`${doc.key}-submitted`} className="text-xs">Submitted</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="pending" id={`${doc.key}-pending`} />
                                  <Label htmlFor={`${doc.key}-pending`} className="text-xs">Pending</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      {form.watch(`documents.${schemaKey}.status`) === 'pending' && (
                        <FormField
                          control={form.control}
                          name={`documents.${schemaKey}.driveLink`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    openPicker(
                                      {
                                        clientId: "124195828012-nsgud3uee4fovodbpr6132pj4t14fgct.apps.googleusercontent.com",
                                        developerKey: "AIzaSyD91U-yC_Zak67WzYvwAFWUvzpJCyltPiA",
                                        viewId: "DOCS",
                                        showUploadView: true,
                                        showUploadFolders: true,
                                        supportDrives: true,
                                        multiselect: false,
                                        callbackFunction: (data) => {
                                          if (data.action === 'picked' && data.docs?.[0]) {
                                            const fileId = data.docs[0].id;
                                            fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=permissions`, {
                                              headers: {
                                                Authorization: `Bearer ${data.oauthToken || window.google.accounts.oauth2.getAccessToken()}`,
                                              },
                                            })
                                              .then((res) => res.json())
                                              .then((fileData) => {
                                                const isShared = fileData.permissions?.some(
                                                  (perm) => perm.type === 'anyone' && perm.role !== 'private'
                                                );

                                                const shareableLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
                                                console.log("fileId:", fileId);
                                                if (!isShared) {
                                                  fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
                                                    method: 'POST',
                                                    headers: {
                                                      Authorization: `Bearer ${data.oauthToken || window.google.accounts.oauth2.getAccessToken()}`,
                                                      'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                      role: 'reader',
                                                      type: 'anyone',
                                                    }),
                                                  })
                                                    .then(() => {
                                                      form.setValue(`documents.${schemaKey}.driveLink`, shareableLink, {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                      });
                                                      toast({
                                                        title: "File Selected",
                                                        description: "File permissions updated and link added.",
                                                      });
                                                    })
                                                    .catch((error) => {
                                                      toast({
                                                        title: "Permission Error",
                                                        description: `Failed to set file permissions: ${error.message}`,
                                                        variant: "destructive",
                                                      });
                                                    });
                                                } else {
                                                  form.setValue(`documents.${schemaKey}.driveLink`, shareableLink, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                  });
                                                  toast({
                                                    title: "File Selected",
                                                    description: "Shareable link added to the form.",
                                                  });
                                                }
                                              })
                                              .catch((error) => {
                                                toast({
                                                  title: "Drive Error",
                                                  description: `Failed to fetch permissions: ${error.message}`,
                                                  variant: "destructive",
                                                });
                                              });
                                          }
                                        },
                                      },
                                      toast
                                    );
                                  }}
                                  className="text-xs"
                                >
                                  Select from Drive
                                </Button>
                              </FormControl>
                              {field.value && (
                                <div className="text-xs text-blue-600 mt-1">
                                  <a href={field.value} target="_blank" rel="noopener noreferrer">
                                    View Selected File
                                  </a>
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>* Click "Select from Drive" to choose a file from Google Drive. A shareable link will be added automatically.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsChecklist;
