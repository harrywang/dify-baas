'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  conversation_id: string;
  query: string;
  answer: string;
  created_at: number;
  message_files?: Array<{
    id: string;
    type: string;
    url: string;
    belongs_to: string;
  }>;
}

interface ChatResponse {
  event: string;
  message_id?: string;
  conversation_id?: string;
  answer?: string;
  created_at?: number;
  metadata?: {
    usage?: {
      total_tokens: number;
      total_price: string;
      latency: number;
    };
  };
  task_id?: string;
  id?: string;
  thought?: string;
  files?: any;
}

export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentMessageRef = useRef<{
    messageId: string;
    conversationId: string;
    answer: string;
  }>({
    messageId: '',
    conversationId: '',
    answer: ''
  });

  const API_KEY = process.env.NEXT_PUBLIC_DIFY_CHATBOT_API_KEY || '';
  const API_BASE_URL = 'http://localhost/v1';

  useEffect(() => {
    scrollToBottom();
    testApiConnection();
  }, [messages]);

  const addDebugLog = (message: string) => {
    setDebugLog(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const testApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {},
          query: "Hello",
          response_mode: "streaming",
          user: "test-user",
          conversation_id: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Test Error Response:', errorData);
        setError(`API Test Failed: ${response.status} ${errorData}`);
        return;
      }

      // If we get here, the connection is successful
      console.log('API Test: Connection successful');
      
      // Clean up the stream
      const reader = response.body?.getReader();
      if (reader) {
        reader.cancel();
      }
    } catch (error) {
      console.error('API Test Error:', error);
      setError(`API Connection Test Failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError('');
    setDebugLog([]); // Clear debug log for new message
    const userMessage = input;
    setInput('');

    currentMessageRef.current = {
      messageId: '',
      conversationId: '',
      answer: ''
    };

    const tempUserMessage: Message = {
      id: Date.now().toString(),
      conversation_id: conversationId,
      query: userMessage,
      answer: '',
      created_at: Math.floor(Date.now() / 1000),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      console.log('Sending request with:', {
        API_KEY: API_KEY ? 'Set' : 'Not Set',
        API_BASE_URL,
        conversationId,
      });

      const requestBody = {
        inputs: {},
        query: userMessage,
        response_mode: 'streaming',
        conversation_id: conversationId || '',
        user: 'test-user',
      };

      console.log('Request body:', requestBody);

      const response = await fetch(`${API_BASE_URL}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.text();
        addDebugLog(`API Error: ${response.status} ${errorData}`);
        throw new Error(`API error: ${response.status} ${errorData}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        addDebugLog(`Raw chunk: ${chunk}`);

        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const jsonData: ChatResponse = JSON.parse(line.slice(6));
              addDebugLog(`Parsed event: ${JSON.stringify(jsonData)}`);

              if (jsonData.event === 'agent_message') {
                currentMessageRef.current = {
                  messageId: jsonData.message_id || currentMessageRef.current.messageId,
                  conversationId: jsonData.conversation_id || currentMessageRef.current.conversationId,
                  answer: currentMessageRef.current.answer + (jsonData.answer || '')
                };

                addDebugLog(`Current message state: ${JSON.stringify(currentMessageRef.current)}`);

                setMessages(prev => {
                  const newMessages = prev.map(msg => 
                    msg.id === tempUserMessage.id
                      ? {
                          ...msg,
                          id: currentMessageRef.current.messageId,
                          conversation_id: currentMessageRef.current.conversationId,
                          answer: currentMessageRef.current.answer,
                        }
                      : msg
                  );
                  addDebugLog(`New messages state: ${JSON.stringify(newMessages)}`);
                  return newMessages;
                });
              }

              if (jsonData.event === 'message_end') {
                addDebugLog('Message end received');
                setConversationId(currentMessageRef.current.conversationId);
              }

              if (jsonData.event === 'error') {
                throw new Error(`Stream error: ${jsonData.message}`);
              }
            } catch (e) {
              addDebugLog(`Error parsing SSE data: ${e}, Raw line: ${line}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setMessages(prev => prev.map(msg => 
        msg.id === tempUserMessage.id
          ? {
              ...msg,
              answer: 'Sorry, there was an error processing your message. Please try again.',
            }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-lg shadow">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm">
          Error: {error}
        </div>
      )}
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={`${message.id}-${index}`} className="space-y-2">
            <div className="flex flex-col space-y-2">
              <div className="bg-blue-100 p-3 rounded-lg self-end max-w-[80%]">
                <p className="text-gray-800 whitespace-pre-wrap">{message.query}</p>
              </div>
              {message.answer !== undefined && message.answer !== '' && (
                <div className="bg-gray-100 p-3 rounded-lg self-start max-w-[80%]">
                  <p className="text-gray-800 whitespace-pre-wrap">{message.answer}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>

      {/* Debug panel */}
      <div className="h-[200px] border-t overflow-y-auto p-4 bg-gray-50 text-xs font-mono">
        <h3 className="font-bold mb-2">Debug Log</h3>
        <div className="space-y-1">
          {debugLog.map((log, index) => (
            <div key={index} className="break-all">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
