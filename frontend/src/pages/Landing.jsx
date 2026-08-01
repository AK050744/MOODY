import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Sparkles, Shield, Heart, BarChart2, MessageCircle, Star } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Mood Analysis', desc: 'Our AI reads between the lines to deeply understand your emotional state.', color: 'from-moody-500 to-purple-600' },
  { icon: Sparkles, title: 'Personalized Recs', desc: 'Movies, music, podcasts, games curated exactly for how you feel right now.', color: 'from-pink-500 to-rose-600' },
  { icon: MessageCircle, title: 'AI Wellness Chat', desc: 'Your compassionate 24/7 companion — always ready to listen and support.', color: 'from-calm-500 to-teal-600' },
  { icon: BookOpen, title: 'Daily Journal', desc: 'AI-guided journaling with prompts that help you process and grow.', color: 'from-yellow-500 to-orange-500' },
  { icon: BarChart2, title: 'Mood Analytics', desc: 'Visualize your emotional patterns with beautiful 30-day trend charts.', color: 'from-blue-500 to-cyan-500' },
  { icon: Shield, title: 'Crisis Support', desc: 'Emergency calm mode, breathing exercises, and crisis hotlines always available.', color: 'from-red-500 to-pink-600' },
];

const stats = [
  { value: '10K+', label: 'Youth Supported' },
  { value: '94%', label: 'Feel Better' },
  { value: '24/7', label: 'Available' },
  { value: 'Free', label: 'Always' },
];

const testimonials = [
  { name: 'Priya S.', age: 19, text: 'Moody helped me through my exam anxiety. The music recs were 🔥 and the AI chat felt like talking to a real friend.', rating: 5 },
  { name: 'Arjun M.', age: 21, text: 'I love the mood analytics. I never realized my stress peaks on Wednesdays! Now I plan my week better.', rating: 5 },
  { name: 'Zara K.', age: 17, text: 'The breathing exercise during calm mode saved me during a panic attack. Literally a lifesaver app.', rating: 5 },
];

import { BookOpen } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-moody-500 to-purple-600 flex items-center justify-center shadow-glow-indigo">
            <span className="text-sm font-bold">M</span>
          </div>
          <span className="font-display font-bold text-xl gradient-text">Moody</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
          <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Orbs */}
        <div className="bg-orb w-[600px] h-[600px] bg-moody-600 top-[-200px] right-[-200px]" />
        <div className="bg-orb w-[400px] h-[400px] bg-purple-600 bottom-[-100px] left-[-100px]" />
        <div className="bg-orb w-[300px] h-[300px] bg-calm-600 top-[30%] left-[20%]" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-moody-600/20 border border-moody-500/30 text-moody-300 text-sm font-medium mb-8">
            <Sparkles size={14} />
            AI-Powered Emotional Wellness Platform
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[1.1] mb-6">
            Your mood deserves{' '}
            <span className="gradient-text">better care</span>
            <br />than being ignored
          </h1>

          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Moody analyzes how you feel and recommends the perfect movies, music, podcasts, and mindfulness content to lift your mood. Free, anonymous, available 24/7.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/signup" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Start Your Wellness Journey
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-4">
              I already have an account
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="glass p-4 text-center">
                <div className="font-display font-black text-2xl gradient-text">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-3 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
              Everything you need to{' '}
              <span className="gradient-text-warm">feel better</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              From mood tracking to AI chat to personalized entertainment — Moody is your complete emotional wellness companion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-hover p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-card`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-moody-950/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-4xl text-center mb-4">
            Real youth, <span className="gradient-text">real results</span>
          </h2>
          <p className="text-white/40 text-center mb-12">Thousands of young people are already taking charge of their emotional health.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-moody-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{t.name}</div>
                    <div className="text-xs text-white/40">Age {t.age}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="bg-orb w-[500px] h-[500px] bg-moody-600 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4">
            Ready to <span className="gradient-text">feel better</span>?
          </h2>
          <p className="text-white/50 text-lg mb-8">Join thousands of young people on their wellness journey. It's free, private, and takes 2 minutes.</p>
          <Link to="/signup" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
            <Heart size={18} />
            Start for Free Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-white/30 text-sm">
        <p>© 2024 Moody. Made with 💙 for youth mental wellness. Always free, always here.</p>
        <p className="mt-2">If you're in crisis, please call iCall: <a href="tel:9152987821" className="text-moody-400 hover:underline">9152987821</a></p>
      </footer>
    </div>
  );
}
