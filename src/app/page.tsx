import WebAnalyzer from '../components/WebAnalyzer';

export default function Home() {
  return (
    <main className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Webpage Summarizer and Classifier</h1>
        <WebAnalyzer />
      </div>
    </main>
  );
}
