'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Logo from '@/components/Logo'

export default function PrivacyPolicyPage() {
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
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
                    <p className="text-muted-foreground text-sm">Last updated: February 25, 2026</p>
                </div>

                <div className="prose prose-invert max-w-none space-y-8 text-foreground/85 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
                        <p className="text-sm leading-relaxed">
                            MockBird (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mock API service, website, and related services (collectively, the &quot;Service&quot;).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
                        <h3 className="text-base font-medium text-foreground/90 mb-2">Account Information</h3>
                        <p className="text-sm leading-relaxed mb-3">
                            When you create an account, we collect your name, email address, and authentication credentials. If you sign up via Google OAuth, we receive your name, email, and profile picture from Google.
                        </p>
                        <h3 className="text-base font-medium text-foreground/90 mb-2">Usage Data</h3>
                        <p className="text-sm leading-relaxed mb-3">
                            We automatically collect information about how you interact with the Service, including the pages you visit, the features you use, the mock endpoints you create, and the requests made to those endpoints. This includes IP addresses, browser type, device information, and timestamps.
                        </p>
                        <h3 className="text-base font-medium text-foreground/90 mb-2">Mock API Data</h3>
                        <p className="text-sm leading-relaxed">
                            We store the mock endpoint configurations you create, including response bodies, headers, status codes, and conditions. We also log metadata about incoming requests to your mock endpoints (such as method, path, headers, and timestamps) for analytics purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>To provide, maintain, and improve the Service</li>
                            <li>To authenticate your identity and manage your account</li>
                            <li>To process and respond to mock API requests</li>
                            <li>To provide usage analytics and request monitoring</li>
                            <li>To send you important service-related communications</li>
                            <li>To detect, prevent, and address technical issues or abuse</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Sharing and Disclosure</h2>
                        <p className="text-sm leading-relaxed mb-3">
                            We do not sell your personal information. We may share your information in the following circumstances:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li><strong>Service Providers:</strong> We use third-party services such as Clerk (authentication), and hosting providers to operate the Service.</li>
                            <li><strong>Organization Members:</strong> If you belong to an organization on MockBird, other members of that organization may see projects and endpoints shared within the organization.</li>
                            <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid legal proceedings.</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Security</h2>
                        <p className="text-sm leading-relaxed">
                            We implement appropriate technical and organizational measures to protect your information. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Retention</h2>
                        <p className="text-sm leading-relaxed">
                            We retain your account information for as long as your account is active. Mock endpoint data and request logs are retained until you delete them or your account is closed. We may retain certain information as required by law or for legitimate business purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights</h2>
                        <p className="text-sm leading-relaxed mb-3">Depending on your jurisdiction, you may have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>Access, correct, or delete your personal information</li>
                            <li>Export your data in a portable format</li>
                            <li>Withdraw consent for data processing</li>
                            <li>Object to or restrict certain data processing activities</li>
                            <li>Lodge a complaint with a data protection authority</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">8. Cookies and Tracking</h2>
                        <p className="text-sm leading-relaxed">
                            We use essential cookies to maintain your authentication session and preferences. We do not use third-party advertising or tracking cookies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">9. Children&apos;s Privacy</h2>
                        <p className="text-sm leading-relaxed">
                            The Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
                        <p className="text-sm leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page and updating the &quot;Last updated&quot; date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Us</h2>
                        <p className="text-sm leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at{' '}
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
