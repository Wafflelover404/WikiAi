// Login (POST /login)
export async function login({ serverUrl, username, password }) {
  return await apiRequest({
    url: `${serverUrl}/login`,
    method: 'POST',
    data: { username, password }
  });
}

// Query knowledge base using WebSocket (streaming support)
export async function queryKnowledgeBase({ serverUrl, token, question, session_id = null, model = null, humanize = true, onMessage = null, useWebSocket = true }) {
  // Use WebSocket if supported and requested
  if (useWebSocket && typeof WebSocket !== 'undefined' && onMessage) {
    return await queryKnowledgeBaseWebSocket({ serverUrl, token, question, session_id, model, humanize, onMessage });
  }
  
  // Fallback to HTTP POST
  return await apiRequest({
    url: `${serverUrl}/query`,
    method: 'POST',
    token,
    data: { question, session_id, model, humanize }
  });
}

// Query knowledge base using WebSocket for streaming responses
export async function queryKnowledgeBaseWebSocket({ serverUrl, token, question, session_id = null, model = null, humanize = true, onMessage }) {
  return new Promise((resolve, reject) => {
    try {
      // Convert HTTP(S) URL to WS(S) URL
      const url = new URL(serverUrl);
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${url.host}/ws/query?token=${encodeURIComponent(token)}`;
      
      const ws = new WebSocket(wsUrl);
      let hasError = false;
      let immediateData = null;
      let overviewData = null;
      let chunksData = null;
      
      ws.onopen = () => {
        // Send query
        ws.send(JSON.stringify({
          question,
          session_id: session_id || null,
          model: model || null,
          humanize: humanize
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Call the message handler
          if (onMessage) {
            onMessage(message);
          }
          
          // Store data based on message type
          switch (message.type) {
            case 'status':
              // Processing status update
              break;
            case 'immediate':
              immediateData = message.data;
              break;
            case 'overview':
              overviewData = message.data;
              break;
            case 'chunks':
              chunksData = message.data;
              break;
            case 'error':
              hasError = true;
              reject(new Error(message.message || 'WebSocket query error'));
              ws.close();
              break;
            case 'complete':
              // Query completed successfully
              ws.close();
              
              // Resolve with combined data
              const result = {
                status: 'success',
                response: {
                  immediate: immediateData,
                  answer: overviewData,
                  chunks: chunksData?.chunks,
                  available_files: chunksData?.available_files,
                  possible_files_by_title: chunksData?.possible_files_by_title,
                  model: immediateData?.model,
                  security_info: immediateData?.security_info
                }
              };
              resolve(result);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          if (onMessage) {
            onMessage({ type: 'error', message: 'Failed to parse message' });
          }
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (!hasError) {
          reject(new Error('WebSocket connection error'));
        }
      };
      
      ws.onclose = (event) => {
        if (!hasError && event.code !== 1000) {
          console.error('WebSocket closed unexpectedly:', event.code, event.reason);
          reject(new Error(`WebSocket closed: ${event.reason || 'Unknown reason'}`));
        }
      };
      
    } catch (error) {
      reject(error);
    }
  });
}

// Get files list (GET /files/list)
export async function getFilesList({ serverUrl, token }) {
  const res = await apiRequest({
    url: `${serverUrl}/files/list`,
    method: 'GET',
    token
  });
  
  // Handle both possible API response formats
  if (typeof res === 'object') {
    if (res.status === 'success' && res.response && Array.isArray(res.response.documents)) {
      return res;
    } else if (Array.isArray(res)) {
      // If API returns array directly, wrap it in expected format
      return {
        status: 'success',
        response: {
          documents: res
        }
      };
    }
  }
  
  // Return empty array if response is invalid
  return {
    status: 'success',
    response: {
      documents: []
    }
  };
}

// Get auto reports (GET /reports/get/auto)
export async function getAutoReports({ serverUrl, token }) {
  let fullUrl = `${serverUrl}/reports/get/auto`;
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };
  
  const res = await fetch(fullUrl, {
    method: 'GET',
    headers
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch auto reports: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    status: 'success',
    response: data.reports || data || []
  };
}

// Get manual reports (GET /reports/get/manual)
export async function getManualReports({ serverUrl, token }) {
  let fullUrl = `${serverUrl}/reports/get/manual`;
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };
  
  const res = await fetch(fullUrl, {
    method: 'GET',
    headers
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch manual reports: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    status: 'success',
    response: data.reports || data || []
  };
}

// Get accounts list (GET /accounts)
export async function getAccounts({ serverUrl, token }) {
  return await apiRequest({
    url: `${serverUrl}/accounts`,
    method: 'GET',
    token
  });
}

// Create user (POST /register)
export async function createUser({ serverUrl, token, userData }) {
  return await apiRequest({
    url: `${serverUrl}/register`,
    method: 'POST',
    token,
    data: userData
  });
}

// Delete user (DELETE /user/delete)
export async function deleteUser({ serverUrl, token, username }) {
  return await apiRequest({
    url: `${serverUrl}/user/delete`,
    method: 'DELETE',
    token,
    params: { username }
  });
}

// Edit user (POST /user/edit)
export async function editUser({ serverUrl, token, userData }) {
  return await apiRequest({
    url: `${serverUrl}/user/edit`,
    method: 'POST',
    token,
    data: userData
  });
}

// Upload file (POST /upload)
export async function uploadFile({ serverUrl, token, file }) {
  const formData = new FormData();
  formData.append('file', file);
  return await apiRequest({
    url: `${serverUrl}/upload`,
    method: 'POST',
    token,
    data: formData
  });
}

// Delete file by ID (DELETE /files/delete_by_fileid)
export async function deleteFileById({ serverUrl, token, fileId }) {
  return await apiRequest({
    url: `${serverUrl}/files/delete_by_fileid`,
    method: 'DELETE',
    token,
    data: { file_id: fileId }
  });
}

// Delete file by filename (DELETE /files/delete_by_filename)
export async function deleteFileByName({ serverUrl, token, filename }) {
  return await apiRequest({
    url: `${serverUrl}/files/delete_by_filename`,
    method: 'DELETE',
    token,
    params: { filename }
  });
}

// Get file content (GET /files/content/:filename)
export async function getFileContent({ serverUrl, token, filename }) {
  let fullUrl = `${serverUrl}/files/content/${encodeURIComponent(filename)}`;
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    'Authorization': `Bearer ${token}`
  };
  
  const res = await fetch(fullUrl, {
    method: 'GET',
    headers
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  // Return the raw response rather than parsing it
  return res;
}

// Edit file content (POST /files/edit)
export async function editFileContent({ serverUrl, token, filename, newContent }) {
  return await apiRequest({
    url: `${serverUrl}/files/edit`,
    method: 'POST',
    token,
    data: { filename, new_content: newContent }
  });
}

// API utility for WikiAi endpoints
export async function apiRequest({ url, method = 'GET', token = '', data = null, params = {} }) {
  let fullUrl = url;
  const headers = {
    'ngrok-skip-browser-warning': 'true'
  };
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
  
  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await res.json();
      // Create a more detailed error message including both status and message
      const errorMessage = errorData.message || errorData.detail || `HTTP error! status: ${res.status}`;
      const error = new Error(errorMessage);
      // Attach the full error response to the error object
      error.response = errorData;
      error.status = res.status;
      throw error;
    }
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const contentType = res.headers.get('content-type');
  // Only parse as JSON if endpoint is known to return JSON
  if (fullUrl.endsWith('/login') || 
      fullUrl.endsWith('/query') || 
      fullUrl.includes('/files/list') ||
      fullUrl.includes('/reports/') ||
      fullUrl.includes('/accounts') ||
      fullUrl.includes('/register') ||
      fullUrl.includes('/user/') ||
      fullUrl.includes('/upload') ||
      fullUrl.includes('/files/delete_')) {
    return await res.json();
  }
  
  // For file content and other endpoints, return raw response
  return res;
}

// Submit manual report (POST /reports/submit/manual)
export async function submitManualReport({ serverUrl, token, issue }) {
  return await apiRequest({
    url: `${serverUrl}/reports/submit/manual`,
    method: 'POST',
    token,
    data: { issue }
  });
}
