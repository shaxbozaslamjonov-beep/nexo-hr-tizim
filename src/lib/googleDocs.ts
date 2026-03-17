import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive'
];

/**
 * Get Google Auth client using Service Account credentials from environment variables
 */
async function getAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('Google Service Account credentials missing in environment variables');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      private_key: privateKey,
      client_email: clientEmail,
    },
    scopes: SCOPES,
  });

  return auth;
}

/**
 * Generates a new Google Doc from a template by replacing placeholders
 * @param templateId The ID of the template Google Doc
 * @param documentTitle The title for the new document
 * @param replacements Object containing placeholders as keys (e.g., '{{ism}}') and values to replace them with
 * @returns The ID of the newly created document
 */
export async function generateDocFromTemplate(
  templateId: string,
  documentTitle: string,
  replacements: Record<string, string>
) {
  try {
    const auth = await getAuthClient();
    const drive = google.drive({ version: 'v3', auth });
    const docs = google.docs({ version: 'v1', auth });

    // 1. Copy the template to a new file
    const copyResponse = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: documentTitle,
      },
    });

    const newDocId = copyResponse.data.id;
    if (!newDocId) throw new Error('Failed to create copy of template');

    // 2. Prepare batch update requests for replacements
    const requests = Object.entries(replacements).map(([key, value]) => ({
      replaceAllText: {
        containsText: {
          text: key,
          matchCase: false,
        },
        replaceText: value,
      },
    }));

    // 3. Execute batch update
    if (requests.length > 0) {
      await docs.documents.batchUpdate({
        documentId: newDocId,
        requestBody: {
          requests,
        },
      });
    }

    return newDocId;
  } catch (error) {
    console.error('Google Docs Generation Error:', error);
    throw error;
  }
}
