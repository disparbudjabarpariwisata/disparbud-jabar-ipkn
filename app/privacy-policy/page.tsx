import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
    title: 'Privacy Policy — Smiling West Java',
    description: 'Privacy Policy for Smiling West Java — West Java Tourism Repository. Compliant with UU PDP No. 27/2022.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <Header />

            <main className="pt-32 pb-20 px-6 md:px-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
                            Legal Document
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Last updated: February 21, 2025
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900">

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">1. Introduction</h2>
                            <p className="leading-relaxed">
                                Smiling West Java (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is the official tourism data repository operated by the
                                <strong> Dinas Pariwisata dan Kebudayaan Provinsi Jawa Barat</strong> (West Java Provincial Tourism and Culture Office).
                                We are committed to protecting the privacy and personal data of all users in accordance with applicable Indonesian laws and regulations.
                            </p>
                            <p className="leading-relaxed">
                                This Privacy Policy describes how we collect, use, store, and protect your personal data when you access and use our website at
                                <strong> smilingwestjava.official.id</strong>.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">2. Legal Basis</h2>
                            <p className="leading-relaxed">
                                This Privacy Policy is established in compliance with the following Indonesian regulations:
                            </p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span><strong>Undang-Undang No. 27 Tahun 2022</strong> — tentang Perlindungan Data Pribadi (Personal Data Protection Law / UU PDP)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span><strong>Undang-Undang No. 11 Tahun 2008</strong> — tentang Informasi dan Transaksi Elektronik (ITE Law), as amended by <strong>UU No. 1 Tahun 2024</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span><strong>Peraturan Pemerintah No. 71 Tahun 2019</strong> — tentang Penyelenggaraan Sistem dan Transaksi Elektronik (PP PSTE)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span><strong>Permenkominfo No. 20 Tahun 2016</strong> — tentang Perlindungan Data Pribadi dalam Sistem Elektronik</span>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">3. Data We Collect</h2>
                            <p className="leading-relaxed">We may collect the following types of personal data:</p>

                            <div className="mt-6 grid md:grid-cols-2 gap-4">
                                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-2">Account Information</h4>
                                    <ul className="text-sm space-y-1 text-gray-600">
                                        <li>• Full name</li>
                                        <li>• Email address</li>
                                        <li>• Organization / institution</li>
                                        <li>• Selected role / profile type</li>
                                    </ul>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-2">Technical Information</h4>
                                    <ul className="text-sm space-y-1 text-gray-600">
                                        <li>• IP address</li>
                                        <li>• Browser type and version</li>
                                        <li>• Device information</li>
                                        <li>• Access timestamps</li>
                                    </ul>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-2">Google SSO Data</h4>
                                    <ul className="text-sm space-y-1 text-gray-600">
                                        <li>• Google profile name</li>
                                        <li>• Google email address</li>
                                        <li>• Profile photo URL</li>
                                    </ul>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-2">Usage Data</h4>
                                    <ul className="text-sm space-y-1 text-gray-600">
                                        <li>• Pages visited</li>
                                        <li>• Features accessed</li>
                                        <li>• Session duration</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">4. Purpose of Data Collection</h2>
                            <p className="leading-relaxed">
                                In accordance with <strong>Article 16 of UU PDP</strong>, personal data is processed for the following legitimate purposes:
                            </p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>Identity verification and account authentication</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>Providing access to the Smiling West Java dashboard and tourism data</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>Tourism statistics analysis for West Java Province</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>Improving website performance and user experience</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>Compliance with legal and regulatory obligations</span>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">5. Data Retention</h2>
                            <p className="leading-relaxed">
                                As required by <strong>Article 25 of UU PDP</strong>, we retain your personal data only for as long as necessary to fulfill the purposes described in this policy.
                                Account data will be retained for the duration of your active account and deleted upon request, subject to legal retention obligations.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">6. Your Rights</h2>
                            <p className="leading-relaxed">
                                Under <strong>UU PDP (Chapter IV)</strong>, you have the following rights regarding your personal data:
                            </p>
                            <div className="mt-6 space-y-3">
                                {[
                                    { right: 'Right to Information', desc: 'Know how your data is collected, processed, and stored' },
                                    { right: 'Right to Access', desc: 'Request a copy of your personal data' },
                                    { right: 'Right to Correction', desc: 'Request corrections to inaccurate data' },
                                    { right: 'Right to Deletion', desc: 'Request deletion of your personal data' },
                                    { right: 'Right to Withdraw Consent', desc: 'Withdraw your consent at any time' },
                                    { right: 'Right to Object', desc: 'Object to the processing of your personal data' },
                                    { right: 'Right to Data Portability', desc: 'Receive your data in a structured format' },
                                ].map((item) => (
                                    <div key={item.right} className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl">
                                        <span className="text-[#F8BC16] text-lg">✓</span>
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.right}</p>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">7. Data Security</h2>
                            <p className="leading-relaxed">
                                We implement appropriate technical and organizational security measures to protect your personal data, including:
                            </p>
                            <ul className="space-y-2 mt-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>SSL/TLS encryption for all data transmissions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>Secure password hashing and storage via Supabase Auth</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>Access controls and authentication mechanisms</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>Regular security audits and vulnerability assessments</span>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">8. Third-Party Services</h2>
                            <p className="leading-relaxed">
                                We use the following third-party services that may process your data:
                            </p>
                            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left p-4 font-semibold text-gray-900">Service</th>
                                            <th className="text-left p-4 font-semibold text-gray-900">Purpose</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="p-4 text-gray-700">Supabase</td>
                                            <td className="p-4 text-gray-600">Authentication and database</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-gray-700">Google OAuth</td>
                                            <td className="p-4 text-gray-600">Single Sign-On authentication</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-gray-700">Vercel</td>
                                            <td className="p-4 text-gray-600">Website hosting and deployment</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-gray-700">Cloudinary</td>
                                            <td className="p-4 text-gray-600">Image optimization and delivery</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">9. Contact Us</h2>
                            <p className="leading-relaxed">
                                For questions, concerns, or requests related to your personal data, please contact our Data Protection Officer:
                            </p>
                            <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="font-bold text-gray-900">Dinas Pariwisata dan Kebudayaan Provinsi Jawa Barat</p>
                                <p className="text-gray-600 mt-1">Jl. L.L.R.E. Martadinata No. 209, Bandung, Jawa Barat 40114</p>
                                <p className="text-gray-600 mt-1">Email: <a href="mailto:disparbud@jabarprov.go.id" className="text-[#F8BC16] hover:underline">disparbud@jabarprov.go.id</a></p>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
