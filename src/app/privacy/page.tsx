'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
                        <ArrowLeft size={20} />
                        <span>Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <Shield className="text-green-600" />
                        <span>Rent On Map</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <article className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
                    <h1 className="text-4xl font-bold mb-2 text-gray-900">Privacy Policy</h1>
                    <p className="text-gray-500 mb-10">Last updated: December 22, 2025</p>

                    <div className="space-y-8 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                            <p>
                                At Rent On Map, we maintain a strong commitment to your privacy. This Privacy Policy describes how we collect, use, and protect your personal information when you use our map-based rental platform. By using our service, you agree to the collection and use of information in accordance with this policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">2.1 Personal Information</h3>
                                    <p>
                                        When you sign in using Google, we collect basic profile information including your name, email address, and profile picture. We do not store your password as authentication is handled securely by Google.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">2.2 Location Data</h3>
                                    <p>
                                        To provide our core map-based search functionality ("Search as I move"), we collect and process your geolocation data when you grant us permission. This data is used solely to display relevant properties in your vicinity and is not stored permanently on our servers.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">2.3 Usage Data</h3>
                                    <p>
                                        We may collect information on how the Service is accessed and used, including your computer’s Internet Protocol address (IP address), browser type, and time spent on pages.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>To Provide Services:</strong> To facilitate property listings, map navigation, and user accounts.</li>
                                <li><strong>To Improve the Platform:</strong> Analyzing usage patterns to enhance user experience and map performance.</li>
                                <li><strong>To Communicate:</strong> Sending essential service updates or responding to your support requests.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies and Tracking Technologies</h2>
                            <p>
                                We use session cookies to maintain your authenticated state (via NextAuth). These are essential for the operation of the application. We do not use third-party advertising cookies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Services</h2>
                            <p>We utilize trusted third-party services to operate our platform:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li><strong>Google Cloud:</strong> For authentication and secure sign-in.</li>
                                <li><strong>MongoDB Atlas:</strong> For secure database hosting information.</li>
                                <li><strong>Cloudinary:</strong> For hosting property images.</li>
                                <li><strong>OpenFreeMap / MapLibre:</strong> For rendering map tiles.</li>
                            </ul>
                            <p className="mt-2">
                                Each of these providers has their own privacy policies governing their use of your data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
                            <p>
                                The security of your data is important to us. We implement standard industry practices, including encryption in transit (HTTPS) and secure database credentials, to protect your personal information. However, no method of transmission over the Internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
                            <p>
                                You have the right to request access to the personal data we hold about you or request its deletion. If you wish to delete your account and all associated data, please contact us at the email provided below.
                            </p>
                        </section>

                        <div className="border-t pt-8 mt-12">
                            <h3 className="font-bold text-gray-900 mb-2">Contact Us</h3>
                            <p className="text-gray-600">
                                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@rentonmap.com" className="text-blue-600 hover:underline">privacy@rentonmap.com</a>.
                            </p>
                        </div>
                    </div>
                </article>
            </main>

            <footer className="bg-white border-t py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Rent On Map. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
