import ChatComponent from '../../components/ChatComponent';

export default function ChatbotPage() {
  return (
    <main className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">AI Chatbot</h1>
        <ChatComponent />
      </div>
    </main>
  );
}
