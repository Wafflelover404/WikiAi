// WebSocket client for streaming responses
class WebSocketClient {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.ws = null;
    this.messageHandlers = [];
    this.connectionPromise = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 1000; // Start with 1 second
    this.pendingMessages = [];
  }

  async connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Ensure URL is properly formatted
        let wsUrl;
        try {
          wsUrl = new URL(this.url);
        } catch (e) {
          // If URL is relative, construct full URL
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const host = window.location.host;
          wsUrl = new URL(`${protocol}//${host}${this.url.startsWith('/') ? '' : '/'}${this.url}`);
        }
        
        // Add token to URL if provided
        if (this.token) {
          wsUrl.searchParams.append('token', this.token);
        }
        
        console.log(`Connecting to WebSocket: ${wsUrl.toString()}`);
        this.ws = new WebSocket(wsUrl.toString());
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          
          // Send any pending messages
          while (this.pendingMessages.length > 0) {
            const { message, resolve: msgResolve, reject: msgReject } = this.pendingMessages.shift();
            try {
              this.ws.send(JSON.stringify(message));
              msgResolve();
            } catch (err) {
              console.error('Error sending pending message:', err);
              msgReject(err);
            }
          }
          
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            console.log('WebSocket message received:', data);
            this.messageHandlers.forEach(handler => {
              try {
                handler(data);
              } catch (err) {
                console.error('Error in WebSocket message handler:', err);
              }
            });
          } catch (error) {
            console.error('Error parsing WebSocket message:', error, 'Raw data:', event.data);
          }
        };
        
        this.ws.onclose = (event) => {
          console.log(`WebSocket closed: ${event.code} ${event.reason || 'No reason provided'}`);
          this.connectionPromise = null;
          if (event.code !== 1000) { // Don't reconnect on normal closure
            this.attemptReconnect();
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (this.ws) {
            this.ws.close(); // Will trigger onclose which will handle reconnection
          }
        };
        
      } catch (error) {
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  async send(message) {
    // If WebSocket is not connected, queue the message
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not connected, queuing message:', message);
      
      // If we're not already trying to connect, try to reconnect
      if (!this.connectionPromise) {
        console.log('Attempting to reconnect WebSocket...');
        try {
          await this.connect();
        } catch (err) {
          console.error('Failed to reconnect WebSocket:', err);
          throw new Error('Failed to connect to WebSocket server');
        }
      }
      
      // If still not connected after reconnect attempt, queue the message
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.log('Still not connected, adding to pending messages');
        return new Promise((resolve, reject) => {
          this.pendingMessages.push({
            message,
            resolve,
            reject
          });
        });
      }
    }
    
    // If we're connected, send the message immediately
    try {
      console.log('Sending WebSocket message:', message);
      this.ws.send(JSON.stringify(message));
      return Promise.resolve();
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return Promise.reject(error);
    }
  }

  onMessage(handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    this.messageHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index !== -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  close() {
    if (this.ws) {
      this.ws.close(1000, 'User closed connection');
      this.ws = null;
      this.connectionPromise = null;
    }
  }
}

// Create a singleton instance
export const wsClient = new WebSocketClient(`ws://${window.location.host}/ws/query`);

// Helper function to get WebSocket URL
function getWebSocketUrl(serverUrl) {
  const url = new URL(serverUrl);
  return `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}/ws/query`;
}

// Create a new WebSocket client for a given server URL
export function createWebSocketClient(serverUrl, token) {
  const wsUrl = getWebSocketUrl(serverUrl);
  return new WebSocketClient(wsUrl, token);
}

export default {
  WebSocketClient,
  wsClient,
  createWebSocketClient
};
