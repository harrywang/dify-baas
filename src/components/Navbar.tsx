import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-lg font-semibold">Dify BaaS</span>
            </Link>
          </div>
          <div className="flex space-x-8">
            <Link href="/summarizer" className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-gray-900">
              Webpage Summarizer
            </Link>
            <Link href="/chatbot" className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-gray-900">
              AI Chatbot
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
