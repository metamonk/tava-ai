import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen grain">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orb */}
        <div
          className="absolute -top-[40%] -right-[20%] w-[80vw] h-[80vw] rounded-full animate-drift"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, rgba(196, 144, 122, 0.15), rgba(168, 181, 160, 0.1) 50%, transparent 70%)',
          }}
        />
        {/* Secondary gradient orb */}
        <div
          className="absolute -bottom-[30%] -left-[20%] w-[70vw] h-[70vw] rounded-full animate-drift"
          style={{
            background:
              'radial-gradient(circle at 70% 70%, rgba(168, 181, 160, 0.12), rgba(156, 168, 193, 0.08) 50%, transparent 70%)',
            animationDelay: '-10s',
          }}
        />
        {/* Accent orb */}
        <div
          className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] rounded-full animate-breathe"
          style={{
            background: 'radial-gradient(circle, rgba(244, 200, 163, 0.1), transparent 60%)',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="glass rounded-full px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c4907a] to-[#a8b5a0] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span className="font-display text-2xl font-semibold tracking-tight text-[#1a1d21] dark:text-[#f5f3ef]">
                Tava
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-[#6b7280] hover:text-[#1a1d21] dark:hover:text-[#f5f3ef] transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-[#6b7280] hover:text-[#1a1d21] dark:hover:text-[#f5f3ef] transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium text-[#6b7280] hover:text-[#1a1d21] dark:hover:text-[#f5f3ef] transition-colors"
              >
                Testimonials
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-[#3d4449] hover:text-[#1a1d21] dark:text-[#9ca3af] dark:hover:text-[#f5f3ef] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#1a1d21] dark:bg-[#f5f3ef] dark:text-[#1a1d21] rounded-full hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-reveal-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#a8b5a0]/10 border border-[#a8b5a0]/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#a8b5a0] animate-pulse" />
            <span className="text-sm font-medium text-[#5a6b52]">
              Trusted by 500+ mental health professionals
            </span>

            <ThemeToggle />
          </div>

          {/* Main Headline */}
          <h1 className="animate-reveal-up delay-100 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-[#1a1d21] dark:text-[#f5f3ef] leading-[1.05] mb-8 text-balance">
            Transform therapy sessions into{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#c4907a] to-[#a8b5a0] bg-clip-text text-transparent">
                healing pathways
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-[#c4907a]/30"
                viewBox="0 0 200 12"
                fill="none"
              >
                <path
                  d="M2 8.5C50 2 150 2 198 8.5"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-reveal-up delay-200 text-lg sm:text-xl text-[#6b7280] max-w-2xl mx-auto mb-12 leading-relaxed text-balance">
            AI-powered treatment planning that captures the nuance of every session, delivering
            clinical insights for therapists and compassionate guidance for clients.
          </p>

          {/* CTA Buttons */}
          <div className="animate-reveal-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group relative px-8 py-4 text-base font-semibold text-white rounded-full overflow-hidden hover-glow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#c4907a] to-[#a67462] animate-gradient-flow" />
              <span className="relative z-10 flex items-center gap-2">
                Start Free Trial
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            <Link
              href="#how-it-works"
              className="group px-8 py-4 text-base font-semibold text-[#3d4449] dark:text-[#9ca3af] rounded-full border border-[#e8e6e1] dark:border-[#2a2f35] hover:border-[#c4907a]/30 hover:bg-[#c4907a]/5 transition-all"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Watch Demo
              </span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="animate-reveal-up delay-400 mt-16 pt-12 border-t border-[#e8e6e1] dark:border-[#2a2f35]">
            <p className="text-xs font-medium uppercase tracking-wider text-[#6b7280] mb-6">
              Trusted by leading practices
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
              {['Stanford Health', 'Mayo Clinic', 'Johns Hopkins', 'Cleveland Clinic'].map(
                (name) => (
                  <span
                    key={name}
                    className="font-display text-xl font-semibold text-[#3d4449] dark:text-[#9ca3af]"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#c4907a]">
              Capabilities
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#1a1d21] dark:text-[#f5f3ef] mt-4 mb-6">
              Everything you need to elevate care
            </h2>
            <p className="text-lg text-[#6b7280] max-w-2xl mx-auto">
              Powerful AI tools designed specifically for mental health professionals, with privacy
              and compliance at the core.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                ),
                title: 'Session Transcription',
                description:
                  'Upload audio recordings and receive precise, speaker-identified transcripts powered by OpenAI Whisper.',
                gradient: 'from-[#c4907a] to-[#f4c8a3]',
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
                title: 'Dual Treatment Plans',
                description:
                  'Generate clinical documentation for therapists and accessible, encouraging summaries for clients.',
                gradient: 'from-[#a8b5a0] to-[#7d8d74]',
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                ),
                title: 'Risk Detection',
                description:
                  'AI-powered safety monitoring identifies concerning content and alerts practitioners in real-time.',
                gradient: 'from-[#9ca8c1] to-[#6b7280]',
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: 'Version History',
                description:
                  'Track plan evolution over time with immutable versioning. See progress and maintain compliance records.',
                gradient: 'from-[#c9a962] to-[#c4907a]',
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
                title: 'Role-Based Views',
                description:
                  'Separate dashboards for therapists and clients, each optimized for their unique needs.',
                gradient: 'from-[#5a6b52] to-[#a8b5a0]',
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
                title: 'HIPAA Compliant',
                description:
                  'Enterprise-grade security with encrypted storage, audit logs, and compliance-first architecture.',
                gradient: 'from-[#3d4449] to-[#6b7280]',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-3xl bg-white dark:bg-[#161a1d] border border-[#e8e6e1] dark:border-[#2a2f35] hover-lift overflow-hidden"
              >
                {/* Gradient accent on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
                />

                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6`}
                >
                  {feature.icon}
                </div>

                <h3 className="font-display text-2xl font-semibold text-[#1a1d21] dark:text-[#f5f3ef] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#6b7280] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 px-6 bg-[#faf8f5] dark:bg-[#1a1d21]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#c4907a]">
              Process
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#1a1d21] dark:text-white mt-4 mb-6">
              Simple. Powerful. Human.
            </h2>
            <p className="text-lg text-[#6b7280] dark:text-[#9ca3af] max-w-2xl mx-auto">
              From session recording to actionable treatment plans in three seamless steps.
            </p>
          </div>

          {/* Steps */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-4">
            {[
              {
                step: '01',
                title: 'Upload Session',
                description:
                  'Record your therapy session or upload an existing audio file. Our AI handles the rest.',
                visual: (
                  <div className="relative w-full aspect-[4/3] rounded-2xl border border-[#e8e6e1] dark:border-[#2a2f35] overflow-hidden">
                    {/* Light mode background */}
                    <div className="absolute inset-0 bg-white dark:hidden" />
                    {/* Dark mode background */}
                    <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-[#2a2f35] to-[#1a1d21]" />
                    <div className="relative h-full flex flex-col items-center justify-center border-2 border-dashed border-[#e8e6e1] dark:border-[#3d4449] rounded-xl m-4">
                      <svg
                        className="w-12 h-12 text-[#c4907a] mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-sm text-[#6b7280]">Drop audio file here</span>
                    </div>
                  </div>
                ),
              },
              {
                step: '02',
                title: 'AI Analysis',
                description:
                  'Advanced AI transcribes, analyzes themes, identifies risks, and extracts clinical insights.',
                visual: (
                  <div className="relative w-full aspect-[4/3] rounded-2xl border border-[#e8e6e1] dark:border-[#2a2f35] overflow-hidden">
                    {/* Light mode background */}
                    <div className="absolute inset-0 bg-white dark:hidden" />
                    {/* Dark mode background */}
                    <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-[#2a2f35] to-[#1a1d21]" />
                    <div className="relative p-6 space-y-3">
                      {[
                        { label: 'Transcribing', progress: 100 },
                        { label: 'Analyzing themes', progress: 100 },
                        { label: 'Risk assessment', progress: 75 },
                        { label: 'Generating plan', progress: 40 },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#3d4449] dark:text-[#9ca3af]">{item.label}</span>
                            <span className="text-[#6b7280]">{item.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-[#e8e6e1] dark:bg-[#3d4449] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#c4907a] to-[#a8b5a0] rounded-full transition-all"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                step: '03',
                title: 'Review & Share',
                description:
                  'Get clinical notes for your records and client-friendly summaries to share.',
                visual: (
                  <div className="relative w-full aspect-[4/3] rounded-2xl border border-[#e8e6e1] dark:border-[#2a2f35] overflow-hidden">
                    {/* Light mode background */}
                    <div className="absolute inset-0 bg-white dark:hidden" />
                    {/* Dark mode background */}
                    <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-[#2a2f35] to-[#1a1d21]" />
                    <div className="relative grid grid-cols-2 gap-3 h-full p-4">
                      <div className="rounded-xl bg-[#faf8f5] dark:bg-[#1a1d21] border border-[#e8e6e1] dark:border-[#3d4449] p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-[#a8b5a0]/20 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-[#a8b5a0]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-[#3d4449] dark:text-[#9ca3af]">
                            Clinical
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 bg-[#e8e6e1] dark:bg-[#3d4449] rounded w-full" />
                          <div className="h-1.5 bg-[#e8e6e1] dark:bg-[#3d4449] rounded w-4/5" />
                          <div className="h-1.5 bg-[#e8e6e1] dark:bg-[#3d4449] rounded w-3/4" />
                        </div>
                      </div>
                      <div className="rounded-xl bg-[#faf8f5] dark:bg-[#1a1d21] border border-[#e8e6e1] dark:border-[#3d4449] p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-[#c4907a]/20 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-[#c4907a]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-[#3d4449] dark:text-[#9ca3af]">
                            Client
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 bg-[#e8e6e1] dark:bg-[#3d4449] rounded w-full" />
                          <div className="h-1.5 bg-[#e8e6e1] dark:bg-[#3d4449] rounded w-3/5" />
                          <div className="h-1.5 bg-[#e8e6e1] dark:bg-[#3d4449] rounded w-4/5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden lg:block absolute top-1/4 -right-2 w-4 h-px bg-gradient-to-r from-[#e8e6e1] dark:from-[#3d4449] to-transparent" />
                )}

                <div className="text-center lg:text-left">
                  {/* Visual */}
                  <div className="mb-8">{item.visual}</div>

                  {/* Step number */}
                  <span className="inline-block font-display text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c4907a] to-[#a8b5a0] mb-4">
                    {item.step}
                  </span>

                  <h3 className="font-display text-2xl font-semibold text-[#1a1d21] dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#c4907a]">
              Testimonials
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#1a1d21] dark:text-[#f5f3ef] mt-4 mb-6">
              Loved by therapists everywhere
            </h2>
          </div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'Tava has transformed how I document sessions. What used to take 30 minutes now takes 5, and the quality is better than what I wrote myself.',
                name: 'Dr. Sarah Chen',
                role: 'Clinical Psychologist',
                image: 'SC',
              },
              {
                quote:
                  'My clients love receiving their session summaries. It helps them remember our conversations and stay motivated between sessions.',
                name: 'Michael Torres',
                role: 'Licensed Therapist',
                image: 'MT',
              },
              {
                quote:
                  'The risk detection feature has been invaluable. It caught warning signs I might have missed during a particularly complex session.',
                name: 'Dr. Emily Watson',
                role: 'Psychiatrist',
                image: 'EW',
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="relative p-8 rounded-3xl bg-white dark:bg-[#161a1d] border border-[#e8e6e1] dark:border-[#2a2f35] hover-lift"
              >
                {/* Quote mark */}
                <svg
                  className="w-10 h-10 text-[#c4907a]/20 mb-6"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
                </svg>

                <p className="text-[#3d4449] dark:text-[#9ca3af] text-lg leading-relaxed mb-8">
                  {testimonial.quote}
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c4907a] to-[#a8b5a0] flex items-center justify-center text-white font-semibold">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-[#6b7280]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#c4907a] via-[#a8b5a0] to-[#c4907a] dark:from-[#1a1d21] dark:via-[#2a2f35] dark:to-[#1a1d21]" />

            {/* Decorative orbs */}
            <div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full animate-drift"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 60%)',
              }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full animate-drift"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent 60%)',
                animationDelay: '-5s',
              }}
            />

            {/* Content */}
            <div className="relative z-10 text-center py-20 px-8">
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white mb-6">
                Ready to transform your practice?
              </h2>
              <p className="text-lg text-white/80 dark:text-[#9ca3af] max-w-xl mx-auto mb-10">
                Join hundreds of mental health professionals who are saving time and delivering
                better care with Tava.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="group px-8 py-4 text-base font-semibold text-[#c4907a] dark:text-[#1a1d21] bg-white rounded-full hover:bg-[#f5f3ef] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    Start Free Trial
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 text-base font-semibold text-white/80 hover:text-white transition-colors"
                >
                  Sign in to existing account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8e6e1] dark:border-[#2a2f35] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c4907a] to-[#a8b5a0] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <span className="font-display text-2xl font-semibold tracking-tight text-[#1a1d21] dark:text-[#f5f3ef]">
                  Tava
                </span>
              </Link>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                AI-powered treatment planning for mental health professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#1a1d21] dark:text-[#f5f3ef] mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-[#6b7280]">
                <li>
                  <Link href="#features" className="hover:text-[#c4907a] transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#c4907a] transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#c4907a] transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1a1d21] dark:text-[#f5f3ef] mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-[#6b7280]">
                <li>
                  <Link href="#" className="hover:text-[#c4907a] transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#c4907a] transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#c4907a] transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1a1d21] dark:text-[#f5f3ef] mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-[#6b7280]">
                <li>
                  <Link href="#" className="hover:text-[#c4907a] transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#c4907a] transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#c4907a] transition-colors">
                    HIPAA
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#e8e6e1] dark:border-[#2a2f35] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#6b7280]">
              &copy; {new Date().getFullYear()} Tava AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-[#6b7280] hover:text-[#c4907a] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Link>
              <Link href="#" className="text-[#6b7280] hover:text-[#c4907a] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
