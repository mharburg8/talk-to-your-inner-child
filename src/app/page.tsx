import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Talk To Your Inner Self
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Have a conversation with your past self through AI-powered audio dialogue
          </p>
          <p className="text-sm text-gray-500 mb-12 max-w-2xl mx-auto">
            Create age personas, upload your voice, and engage in meaningful reflective conversations.
            This is not therapy—it's a tool for self-reflection and exploration.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">🎭</div>
              <h3 className="text-lg font-semibold mb-2">Create Personas</h3>
              <p className="text-gray-600 text-sm">
                Define age personas with custom contexts, tones, and voice references
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">🎙️</div>
              <h3 className="text-lg font-semibold mb-2">Voice Conversations</h3>
              <p className="text-gray-600 text-sm">
                Engage in natural audio dialogues with AI matching your voice
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Private & Secure</h3>
              <p className="text-gray-600 text-sm">
                Full control over your data—delete anytime, no compromises
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-lg text-left">
            <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important Notice</h4>
            <p className="text-sm text-amber-800">
              This application is for reflective self-exploration only. It is NOT a substitute for
              professional mental health care, therapy, or medical advice. If you're experiencing
              a mental health crisis, please contact a qualified professional or crisis helpline immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}