'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Logo from '@/components/Logo'

export default function TermsOfServicePage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <Logo size={32} />
                        <span className="text-lg font-bold tracking-tight">MockBird</span>
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={14} />
                        Back
                    </button>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">Terms of Service</h1>
                    <p className="text-muted-foreground text-sm">Last updated: February 25, 2026</p>
                </div>

                <div className="prose prose-invert max-w-none space-y-8 text-foreground/85 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                        <p className="text-sm leading-relaxed">
                            By accessing or using MockBird (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service. We reserve the right to update these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
                        <p className="text-sm leading-relaxed">
                            MockBird is a mock API platform that allows users to create, manage, and share mock API endpoints. The Service provides features including mock endpoint creation, conditional response routing, request logging, team collaboration through organizations, and sharable live URLs.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Account Registration</h2>
                        <p className="text-sm leading-relaxed mb-3">To use the Service, you must create an account. You agree to:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>Provide accurate, current, and complete registration information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Promptly notify us of any unauthorized account access</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Acceptable Use</h2>
                        <p className="text-sm leading-relaxed mb-3">You agree not to use the Service to:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>Violate any applicable laws or regulations</li>
                            <li>Host, store, or transmit malicious content or malware</li>
                            <li>Impersonate or misrepresent your affiliation with any person or entity</li>
                            <li>Distribute spam or unsolicited communications via mock endpoints</li>
                            <li>Attempt to gain unauthorized access to other accounts or systems</li>
                            <li>Interfere with or disrupt the integrity or performance of the Service</li>
                            <li>Use mock endpoints to phish, scam, or deceive users</li>
                            <li>Create mock endpoints that return illegal or harmful content</li>
                            <li>Circumvent rate limits or usage restrictions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Content and Data</h2>
                        <h3 className="text-base font-medium text-foreground/90 mb-2">Your Content</h3>
                        <p className="text-sm leading-relaxed mb-3">
                            You retain ownership of all content you create on the Service, including mock endpoint configurations, response bodies, and project settings. By using the Service, you grant us a limited license to store, process, and serve your content as necessary to provide the Service.
                        </p>
                        <h3 className="text-base font-medium text-foreground/90 mb-2">Shared Endpoints</h3>
                        <p className="text-sm leading-relaxed">
                            Mock endpoints you create may be accessible via public URLs. You are responsible for ensuring that the data served through your mock endpoints does not violate any third-party rights or applicable laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">6. Organizations and Teams</h2>
                        <p className="text-sm leading-relaxed">
                            If you create or join an organization, you agree that the organization administrator may manage access to projects and endpoints within that organization. When you leave an organization, you may lose access to projects that belong to that organization.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">7. Service Availability</h2>
                        <p className="text-sm leading-relaxed">
                            We strive to maintain high availability of the Service, but we do not guarantee uninterrupted or error-free operation. The Service is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis. We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time with or without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">8. Free and Paid Plans</h2>
                        <p className="text-sm leading-relaxed">
                            MockBird offers a free tier for personal use. Paid plans may be available with additional features and higher usage limits. If you subscribe to a paid plan, you agree to pay all applicable fees. We reserve the right to change pricing with reasonable notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">9. Intellectual Property</h2>
                        <p className="text-sm leading-relaxed">
                            The Service, including its design, code, features, documentation, and branding, is owned by MockBird and protected by intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the Service without our prior written consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">10. Limitation of Liability</h2>
                        <p className="text-sm leading-relaxed">
                            To the maximum extent permitted by law, MockBird shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill arising from your use of the Service. Our total liability for any claim relating to the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">11. Indemnification</h2>
                        <p className="text-sm leading-relaxed">
                            You agree to indemnify and hold harmless MockBird, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">12. Termination</h2>
                        <p className="text-sm leading-relaxed">
                            We may suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion. You may delete your account at any time. Upon termination, your right to use the Service ceases immediately, and we may delete your data after a reasonable retention period.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">13. Governing Law</h2>
                        <p className="text-sm leading-relaxed">
                            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which MockBird operates, without regard to conflict of law principles.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">14. Contact Us</h2>
                        <p className="text-sm leading-relaxed">
                            If you have any questions about these Terms of Service, please contact us at{' '}
                            <a href="mailto:gauravrai2002@gmail.com" className="text-primary hover:underline">gauravrai2002@gmail.com</a>.
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-8 px-6">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Logo size={24} />
                        <span className="text-sm font-semibold">MockBird</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} MockBird. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}
