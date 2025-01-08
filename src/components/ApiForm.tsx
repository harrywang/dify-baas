'use client';

import { useState } from 'react';

interface LLMStats {
  nodeCount: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}

export default function ApiForm() {
  const [url, setUrl] = useState('https://harrywang.me/car');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOutput, setDebugOutput] = useState('');
  const [finalResult, setFinalResult] = useState<any>({
    url: '',
    summary: '',
    category: ''
  });
  const [llmStats, setLLMStats] = useState<LLMStats>({
    nodeCount: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalCost: 0
  });

  const cleanMarkdownJSON = (str: string) => {
    return str.replace(/```json\s*|\s*```/g, '').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');
    setDebugOutput('');
    setFinalResult({
      url: url,
      summary: 'Analyzing...',
      category: 'Pending'
    });
    setLLMStats({
      nodeCount: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0
    });

    try {
      const res = await fetch('http://localhost/v1/workflows/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            url: url
          },
          response_mode: "streaming",
          user: "abc-123"
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let rawOutput = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          rawOutput += chunk;
          setDebugOutput(rawOutput);

          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                if (jsonStr === '[DONE]') continue;
                const jsonData = JSON.parse(jsonStr);
                console.log('Event type:', jsonData.event);

                if (jsonData.event === 'message') {
                  setResponse(jsonData.answer || jsonData.message || '');
                } else if (jsonData.event === 'node_finished' && jsonData.data.node_type === 'llm') {
                  console.log('LLM node finished:', jsonData.data);
                  const outputs = jsonData.data.outputs;
                  const usage = outputs?.usage;
                  console.log('LLM usage:', usage);
                  
                  if (usage) {
                    const stats = {
                      nodeCount: 1,
                      inputTokens: usage.prompt_tokens || 0,
                      outputTokens: usage.completion_tokens || 0,
                      totalCost: parseFloat(usage.total_price) || 0
                    };
                    console.log('Setting LLM stats:', stats);
                    setLLMStats(stats);
                  }
                } else if (jsonData.event === 'workflow_finished') {
                  console.log('Workflow finished data:', jsonData.data);
                  console.log('Outputs:', jsonData.data.outputs);
                  
                  if (jsonData.data.outputs.大语言模型输出) {
                    try {
                      const cleanedJSON = cleanMarkdownJSON(jsonData.data.outputs.大语言模型输出);
                      console.log('Cleaned JSON string:', cleanedJSON);
                      const llmOutput = JSON.parse(cleanedJSON);
                      console.log('Parsed LLM output:', llmOutput);
                      
                      const result = {
                        url: jsonData.data.outputs.网页链接,
                        summary: llmOutput.内容概述,
                        category: llmOutput.类别
                      };
                      console.log('Final result:', result);
                      setFinalResult(result);
                    } catch (e) {
                      console.error('Error parsing LLM output:', e);
                      setError('Error parsing LLM output: ' + e.message);
                      setFinalResult({
                        url: url,
                        summary: 'Error analyzing content',
                        category: 'Error'
                      });
                    }
                  } else {
                    console.log('No LLM output found in data');
                    setFinalResult({
                      url: url,
                      summary: 'No analysis available',
                      category: 'N/A'
                    });
                  }
                }
              } catch (e) {
                console.error('Error parsing JSON:', e, 'Line:', line);
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setFinalResult({
        url: url,
        summary: 'Error analyzing content',
        category: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL to Analyze
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="https://example.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {loading ? 'Analyzing...' : 'Analyze URL'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mt-4 border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Result</h3>
        <div className="space-y-3">
          <div>
            <span className="font-semibold">URL: </span>
            {finalResult.url ? (
              <a href={finalResult.url} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:text-blue-800">
                {finalResult.url}
              </a>
            ) : (
              <span className="text-gray-500">No URL provided</span>
            )}
          </div>
          <div>
            <span className="font-semibold">Summary: </span>
            <span className={loading ? "text-gray-500 animate-pulse" : ""}>
              {finalResult.summary || 'No summary available'}
            </span>
          </div>
          <div>
            <span className="font-semibold">Category: </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              loading ? 'bg-gray-100 text-gray-800' :
              finalResult.category === 'Error' ? 'bg-red-100 text-red-800' :
              finalResult.category === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {finalResult.category || 'Uncategorized'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">LLM Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">LLM Nodes</div>
            <div className="text-lg font-semibold">{llmStats.nodeCount}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Input Tokens</div>
            <div className="text-lg font-semibold">{llmStats.inputTokens.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Output Tokens</div>
            <div className="text-lg font-semibold">{llmStats.outputTokens.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Total Cost</div>
            <div className="text-lg font-semibold">
              ${llmStats.totalCost.toFixed(6)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Raw Response:</h3>
        <pre className="p-4 bg-gray-100 rounded-md overflow-x-auto text-sm">
          {debugOutput || 'No response data yet'}
        </pre>
      </div>
    </div>
  );
}
