'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
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
                        <FileText className="text-blue-600" />
                        <span>Rent On Map</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <article className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
                    <h1 className="text-4xl font-bold mb-2 text-gray-900">Terms of Service</h1>
                    <p className="text-gray-500 mb-10">Last updated: December 22, 2025</p>

                    <div className="space-y-8 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using <strong>Rent On Map</strong> ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms constitute a legally binding agreement between you and Rent On Map regarding your use of the website and services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                            <p>
                                Rent On Map provides a map-based real estate platform that connects property owners ("Landlords") with prospective tenants ("Renters"). We offer tools for listing properties, searching via interactive maps, and managing rental inquiries.
                            </p>
                            <p className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                                <strong>Note:</strong> Rent On Map acts solely as an intermediary platform. We do not own, manage, or inspect the properties listed, nor are we a party to any rental agreement entered into between users.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You must be at least 18 years old to create an account.</li>
                                <li>We utilize Google Sign-In for authentication to ensure security. You remain responsible for maintaining the confidentiality of your account.</li>
                                <li>You agree to provide accurate, current, and complete information during the registration process.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Location Services</h2>
                            <p>
                                Our Platform relies heavily on location data to provide map-based search functionality. By using the "Search as I move" or "Locate Me" features, you consent to the processing of your geolocation data. You can control these permissions through your browser settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Conduct & Content Policy</h2>
                            <p>You agree not to post content that:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Is false, misleading, or fraudulent (e.g., fake property listings).</li>
                                <li>Violates any local housing laws or fair housing regulations.</li>
                                <li>Contains offensive, defamatory, or illicit material.</li>
                                <li>Infringes on the intellectual property rights of others.</li>
                            </ul>
                            <p className="mt-4">
                                We reserve the right to remove any listing or suspend any account that violates these policies without prior notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
                            <p>
                                To the fullest extent permitted by law, Rent On Map shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of the Platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
                            <p>
                                We may modify these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page. Your continued use of the Platform after such changes constitutes your acceptance of the new Terms.
                            </p>
                        </section>

                        <div className="border-t pt-8 mt-12">
                            <h3 className="font-bold text-gray-900 mb-2">Contact Us</h3>
                            <p className="text-gray-600">
                                If you have any questions about these Terms, please contact us at <a href="mailto:legal@rentonmap.com" className="text-blue-600 hover:underline">legal@rentonmap.com</a>.
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
