import WebAnalyzer from '../components/WebAnalyzer';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Dify BaaS Demo</h1>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <Link href="/summarizer" className="block">
              <h2 className="text-xl font-semibold mb-2">Webpage Summarizer</h2>
              <p className="text-gray-600">Analyze and summarize any webpage content</p>
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <Link href="/chatbot" className="block">
              <h2 className="text-xl font-semibold mb-2">AI Chatbot</h2>
              <p className="text-gray-600">Chat with our intelligent AI assistant</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
