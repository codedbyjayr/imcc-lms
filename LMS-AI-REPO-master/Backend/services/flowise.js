const FLOWISE_URL = (process.env.FLOWISE_URL || 'http://localhost:3000').replace(/\/$/, '');
const FLOWISE_CHATFLOW_ID = process.env.FLOWISE_CHATFLOW_ID;

async function askFlowise(question, userId = '') {
  if (!FLOWISE_CHATFLOW_ID) {
    throw new Error('FLOWISE_CHATFLOW_ID is not configured.');
  }

  const response = await fetch(
    `${FLOWISE_URL}/api/v1/prediction/${encodeURIComponent(FLOWISE_CHATFLOW_ID)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, chatId: userId }),
    }
  );

  const responseText = await response.text();
  let data = {};
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch (_error) {
      throw new Error('Flowise returned an invalid response.');
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || `Flowise request failed with status ${response.status}.`);
  }

  return data.text || data.output || data.message || '';
}

module.exports = { askFlowise };
