
// Add global declarations for Google Picker and gapi
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

/**
 * Loads the Google Picker API and opens the picker dialog.
 * @param options Picker options and callback.
 * @param toast Toast function to display errors.
 */
export function openPicker(
  options: {
    clientId: string;
    developerKey: string;
    viewId?: string;
    showUploadView?: boolean;
    showUploadFolders?: boolean;
    supportDrives?: boolean;
    multiselect?: boolean;
    callbackFunction: (data: any) => void;
  },
  toast: (props: { title: string; description: string; variant?: 'default' | 'destructive' }) => void
) {
  // Ensure Google API scripts are loaded
  function loadGoogleApis() {
    return new Promise<void>((resolve, reject) => {
      if (window.gapi && window.google && window.google.picker) {
        resolve();
      } else {
        const script1 = document.createElement('script');
        script1.src = 'https://apis.google.com/js/api.js';
        script1.async = true;
        script1.onload = () => {
          const script2 = document.createElement('script');
          script2.src = 'https://accounts.google.com/gsi/client';
          script2.async = true;
          script2.onload = () => resolve();
          script2.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
          document.body.appendChild(script2);
        };
        script1.onerror = () => reject(new Error('Failed to load Google API script'));
        document.body.appendChild(script1);
      }
    });
  }

  // Initialize gapi and authenticate
  function initializeGapiAndAuthenticate() {
    return new Promise<string>((resolve, reject) => {
      window.gapi.load('client:picker', {
        callback: () => {
          // Initialize Google Identity Services
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: options.clientId,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: (response: any) => {
              if (response.error) {
                reject(new Error(`Authentication failed: ${response.error}`));
              } else {
                resolve(response.access_token);
              }
            },
          });

          // Request an access token
          tokenClient.requestAccessToken({ prompt: '' });
        },
      });
    });
  }

  // Create and show the picker
  function createPicker(oauthToken: string) {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId[options.viewId || 'DOCS'])
      .setIncludeFolders(true)
      .setSelectFolderEnabled(!!options.showUploadFolders);

    let pickerBuilder = new window.google.picker.PickerBuilder()
      .setAppId(options.clientId.split('-')[0])
      .setOAuthToken(oauthToken)
      .setDeveloperKey(options.developerKey)
      .addView(view)
      .setCallback(options.callbackFunction);

    if (options.showUploadView) {
      pickerBuilder = pickerBuilder.addView(new window.google.picker.DocsUploadView());
    }
    if (options.multiselect) {
      pickerBuilder = pickerBuilder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
    }
    if (options.supportDrives) {
      pickerBuilder = pickerBuilder.enableFeature(window.google.picker.Feature.SUPPORT_DRIVES);
    }

    pickerBuilder.build().setVisible(true);
  }

  // Main execution flow
  loadGoogleApis()
    .then(() => initializeGapiAndAuthenticate())
    .then((oauthToken) => createPicker(oauthToken))
    .catch((error) => {
      toast({
        title: 'Error',
        description: `Failed to initialize Google Picker: ${error.message}`,
        variant: 'destructive',
      });
    });
}
