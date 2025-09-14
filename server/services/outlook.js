import { Client } from '@microsoft/microsoft-graph-client';

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=outlook',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Outlook not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableOutlookClient() {
  const accessToken = await getAccessToken();

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => accessToken
    }
  });
}

/**
 * Fetch emails from Outlook using Microsoft Graph API
 * @param {number} limit - Maximum number of emails to fetch
 * @returns {Promise<Array>} Array of email objects
 */
export async function fetchOutlookEmails(limit = 50) {
  try {
    const client = await getUncachableOutlookClient();
    
    const messages = await client
      .api('/me/messages')
      .top(limit)
      .select('id,subject,from,body,receivedDateTime,isRead,importance')
      .orderby('receivedDateTime desc')
      .get();

    return messages.value.map(msg => ({
      id: msg.id,
      sender: msg.from?.emailAddress?.address || 'unknown@example.com',
      senderName: msg.from?.emailAddress?.name || 'Unknown',
      subject: msg.subject || 'No Subject',
      body: msg.body?.content || '',
      receivedAt: new Date(msg.receivedDateTime),
      isRead: msg.isRead,
      importance: msg.importance // 'low', 'normal', 'high'
    }));
  } catch (error) {
    console.error('Failed to fetch Outlook emails:', error.message);
    throw new Error(`Outlook sync failed: ${error.message}`);
  }
}

/**
 * Check if Outlook connection is available
 * @returns {Promise<boolean>}
 */
export async function isOutlookConnected() {
  try {
    await getAccessToken();
    return true;
  } catch (error) {
    console.log('Outlook not connected:', error.message);
    return false;
  }
}