// Query knowledge base
export async function queryKnowledgeBase({ serverUrl, token, text, humanize = false }) {
  return await apiRequest({
    url: `${serverUrl}/query?humanize=${humanize}`,
    method: 'POST',
    token,
    data: { text }
  });
}

// Get files list
export async function getFilesList({ serverUrl, token }) {
  return await apiRequest({
    url: `${serverUrl}/files/list`,
    method: 'GET',
    token
  });
}

// Get file content
export async function getFileContent({ serverUrl, token, filename }) {
  return await apiRequest({
    url: `${serverUrl}/files/file_content`,
    method: 'GET',
    token,
    params: { filename }
  });
}
// API utility for kb-sage endpoints
export async function apiRequest({ url, method = 'GET', token = '', data = null, params = {} }) {
  let fullUrl = url;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (method === 'POST' && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  // Add query params for GET requests
  if (Object.keys(params).length > 0) {
    const query = new URLSearchParams(params).toString();
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + query;
  }
  const options = {
    method,
    headers,
  };
  if (data) {
    options.body = data instanceof FormData ? data : JSON.stringify(data);
  }
  const res = await fetch(fullUrl, options);
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  return await res.text();
}
