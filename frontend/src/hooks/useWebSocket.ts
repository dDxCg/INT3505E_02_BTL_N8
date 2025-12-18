import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * WebSocket Event Types from Backend EventBus
 */
interface WebSocketMessage {
  event:
    | 'order_created'
    | 'order_updated'
    | 'order_completed'
    | 'order_item_created'
    | 'order_item_updated';
  data: any;
}

/**
 * Custom hook for WebSocket connection to backend
 * Automatically invalidates React Query caches when events are received
 *
 * Backend WebSocket endpoint: ws://localhost:8000/ws
 * Events are broadcast from backend/ws/EventBus.py
 */
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connect = () => {
      // Get base API URL and convert to WebSocket URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

      // Convert http://localhost:8000/api/v1 → ws://localhost:8000
      const wsUrl = apiUrl
        .replace('http://', 'ws://')
        .replace('https://', 'wss://')
        .replace('/api/v1', '');

      console.log('🔌 Connecting to WebSocket:', `${wsUrl}/ws`);

      try {
        ws.current = new WebSocket(`${wsUrl}/ws`);

        ws.current.onopen = () => {
          console.log('✅ WebSocket Connected');
          setIsConnected(true);

          // Clear any pending reconnection attempts
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        ws.current.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('📨 WebSocket Event:', message.event, message.data);

            // Invalidate React Query caches based on event type
            // This triggers automatic refetch of affected data
            switch (message.event) {
              case 'order_created':
                console.log('🆕 New order created:', message.data);
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                queryClient.invalidateQueries({ queryKey: ['tables'] });
                break;

              case 'order_updated':
                console.log('🔄 Order updated:', message.data);
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                queryClient.invalidateQueries({ queryKey: ['tables'] });
                // Invalidate specific order if we have the ID
                if (message.data?.id) {
                  queryClient.invalidateQueries({ queryKey: ['orders', message.data.id] });
                }
                break;

              case 'order_completed':
                console.log('✅ Order completed:', message.data);
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                queryClient.invalidateQueries({ queryKey: ['tables'] });
                break;

              case 'order_item_created':
                console.log('🍽️ Order item created:', message.data);
                queryClient.invalidateQueries({ queryKey: ['orderItems'] });
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                // Invalidate specific order's items
                if (message.data?.order_id) {
                  queryClient.invalidateQueries({
                    queryKey: ['orderItems', message.data.order_id]
                  });
                }
                break;

              case 'order_item_updated':
                console.log('🔄 Order item updated:', message.data);
                queryClient.invalidateQueries({ queryKey: ['orderItems'] });
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                // Invalidate specific order's items
                if (message.data?.order_id) {
                  queryClient.invalidateQueries({
                    queryKey: ['orderItems', message.data.order_id]
                  });
                }
                break;

              default:
                console.warn('Unknown WebSocket event:', message.event);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.current.onclose = () => {
          console.log('❌ WebSocket Disconnected');
          setIsConnected(false);

          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect WebSocket...');
            connect();
          }, 3000);
        };

        ws.current.onerror = (error) => {
          console.error('❌ WebSocket Error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setIsConnected(false);

        // Retry connection after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Retrying WebSocket connection...');
          connect();
        }, 5000);
      }
    };

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      console.log('🔌 Closing WebSocket connection...');

      // Clear reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Close WebSocket connection
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [queryClient]);

  return {
    isConnected,
    /**
     * WebSocket connection status
     * - true: Connected and receiving events
     * - false: Disconnected (will auto-reconnect)
     */
  };
};
