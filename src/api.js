
// Query knowledge base (POST /query)
export async function queryKnowledgeBase({ serverUrl, token, question, session_id = null, model = null }) {
  return await apiRequest({
    url: `${serverUrl}/query`,
    method: 'POST',
    token,
    data: { question, session_id, model }
  });
}

// Get files list (GET /files/list)
export async function getFilesList({ serverUrl, token }) {
  return await apiRequest({
    url: `${serverUrl}/files/list`,
    method: 'GET',
    token
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
