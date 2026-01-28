import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 font-medium text-sm animate-fade-in">
            ✨ Rediscover your inner voice
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-secondary-900 mb-8 tracking-tight leading-tight">
            Talk To Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Inner Self</span>
          </h1>

          <p className="text-xl md:text-2xl text-secondary-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Have a meaningful conversation with your past self through AI-powered audio dialogue.
            Reflect, heal, and grow with a voice that understands you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto text-lg px-10 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-1">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-10 border-2 hover:bg-primary-50">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="glass-panel p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl mb-6">
                🎭
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Create Personas</h3>
              <p className="text-secondary-600 leading-relaxed">
                Define age personas with custom contexts, tones, and voice references to match different stages of your life.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl mb-6">
                🎙️
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Voice Conversations</h3>
              <p className="text-secondary-600 leading-relaxed">
                Engage in natural audio dialogues with AI that adapts to your voice and emotional context.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl mb-6">
                🔒
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Private & Secure</h3>
              <p className="text-secondary-600 leading-relaxed">
                Your journey is personal. Full control over your data with enterprise-grade security and privacy.
              </p>
            </div>
          </div>

          <div className="mt-24 p-8 bg-amber-50/50 border border-amber-200/50 rounded-2xl text-left backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="text-2xl">⚠️</div>
              <div>
                <h4 className="font-bold text-amber-900 mb-2">Important Notice</h4>
                <p className="text-amber-800/80 leading-relaxed">
                  This application is for reflective self-exploration only. It is NOT a substitute for
                  professional mental health care, therapy, or medical advice. If you're experiencing
                  a mental health crisis, please contact a qualified professional or crisis helpline immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}