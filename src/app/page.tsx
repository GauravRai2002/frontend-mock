'use client'
import React, { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import {
  Zap, Shield, Clock, Code2, Users, BarChart3,
  ArrowRight, CheckCircle2, Sparkles, Globe, Layers
} from 'lucide-react'
import Logo from '@/components/Logo'

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  // While Clerk is loading, show nothing (prevents flash)
  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-lg font-bold tracking-tight">MockBird</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8">
            <Sparkles size={12} />
            Now in Public Beta
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Mock APIs in
            <span className="bg-gradient-to-r from-primary via-amber-400 to-orange-500 bg-clip-text text-transparent"> seconds</span>,
            <br />not hours.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Create instant, sharable mock API endpoints. Define your responses, get a live URL, and start building your frontend — no backend required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/auth/signup')}
              className="group flex items-center gap-2 px-8 py-3.5 text-base font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.35)] cursor-pointer"
            >
              Start Building Free
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-6 py-3.5 text-base font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:border-border/80 transition-all cursor-pointer"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Code preview */}
        <div className="max-w-3xl mx-auto mt-20 relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-sm" />
          <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28ca42]" />
              </div>
              <span className="text-xs text-muted-foreground ml-2 font-mono">
                GET https://mockbird.co/m/my-project/api/users
              </span>
            </div>
            <pre className="p-6 text-sm font-mono text-foreground/90 leading-relaxed overflow-x-auto">
              <code>{`{
  "users": [
    {
      "id": "u_8x92kf",
      "name": "Sarah Chen",
      "email": "sarah@acme.co",
      "role": "admin"
    },
    {
      "id": "u_3m71qp",
      "name": "Alex Rivera",
      "email": "alex@acme.co",
      "role": "member"
    }
  ],
  "total": 2,
  "page": 1
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Three steps. That&apos;s it.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Go from zero to a working API endpoint in under 2 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <Code2 size={22} />,
                title: 'Define Your Response',
                description: 'Write the JSON (or XML, HTML, plain text) you want your endpoint to return. Set status codes, headers, and delays.'
              },
              {
                step: '02',
                icon: <Globe size={22} />,
                title: 'Get a Live URL',
                description: 'Instantly get a unique URL that anyone can hit. CORS is enabled by default — use it from any frontend, anywhere.'
              },
              {
                step: '03',
                icon: <BarChart3 size={22} />,
                title: 'Monitor & Iterate',
                description: 'See every request that hits your mock. Track response times, view logs, and tweak responses in real-time.'
              }
            ].map((item) => (
              <div key={item.step} className="group relative p-6 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300">
                <div className="text-xs font-bold text-primary/60 mb-4">{item.step}</div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to mock, test, and ship.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for frontend developers, API designers, QA engineers, and educators.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Sparkles size={20} />,
                title: 'AI-Powered Generation',
                desc: 'Describe your API in plain English and let AI instantly generate complete mocked endpoints and scenarios.'
              },
              {
                icon: <Layers size={20} />,
                title: 'Multiple Responses',
                desc: 'Define multiple responses per endpoint with conditional logic or weighted random selection.'
              },
              {
                icon: <Shield size={20} />,
                title: 'Conditional Routing',
                desc: 'Route to different responses based on headers, query params, request body, or path parameters.'
              },
              {
                icon: <Clock size={20} />,
                title: 'Response Delays',
                desc: 'Simulate slow networks with configurable delays from 0ms to 10 seconds.'
              },
              {
                icon: <Users size={20} />,
                title: 'Team Collaboration',
                desc: 'Create organizations, invite team members, and manage access with role-based permissions.'
              },
              {
                icon: <Code2 size={20} />,
                title: 'Multi-Format Support',
                desc: 'Return JSON, XML, HTML, or plain text responses. Set custom status codes and headers.'
              },
              {
                icon: <BarChart3 size={20} />,
                title: 'Request Analytics',
                desc: 'Track every request to your mocks — see total hits, timing, and usage patterns.'
              }
            ].map((feature) => (
              <div key={feature.title} className="p-5 rounded-xl border border-border bg-card/30 hover:bg-card/60 transition-colors duration-200">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Use Cases ─── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Who is MockBird for?</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Frontend Developers',
                items: ['Build UIs without waiting for backend', 'Test edge cases and error states', 'Share working demos with clients']
              },
              {
                title: 'API Designers',
                items: ['Prototype APIs before writing code', 'Embed live examples in documentation', 'Iterate on contracts with your team']
              },
              {
                title: 'QA Engineers',
                items: ['Create specific test scenarios on demand', 'Simulate errors and timeouts', 'Reproduce bugs reliably']
              },
              {
                title: 'Educators & Content Creators',
                items: ['Provide consistent APIs for tutorials', 'Zero setup for students', 'No server maintenance']
              }
            ].map((useCase) => (
              <div key={useCase.title} className="p-6 rounded-2xl border border-border bg-card/30">
                <h3 className="text-lg font-semibold mb-4">{useCase.title}</h3>
                <ul className="space-y-2.5">
                  {useCase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison ─── */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">
            The old way vs. MockBird
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5">
              <h3 className="font-semibold text-destructive mb-4">Without MockBird</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {['Set up a server', 'Write backend route handlers', 'Deploy somewhere', 'Manage infrastructure', 'Configure CORS manually', 'Wait for backend team'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-destructive">✕</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
              <h3 className="font-semibold text-primary mb-4">With MockBird</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {['Define what you want to return', 'Get a URL instantly', 'Use it immediately', 'CORS handled for you', 'Share with anyone', 'Iterate in real-time'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to build faster?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Join developers who are shipping frontends without waiting for backends. Free forever for personal projects.
          </p>
          <button
            onClick={() => router.push('/auth/signup')}
            className="group inline-flex items-center gap-2 px-10 py-4 text-base font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:shadow-[0_0_50px_rgba(245,158,11,0.35)] cursor-pointer"
          >
            Get Started — It&apos;s Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-sm font-semibold">MockBird</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MockBird. Built for developers, by developers.
          </p>
        </div>
      </footer>
    </div>
  )
}
