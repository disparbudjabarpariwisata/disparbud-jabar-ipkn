import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
    title: 'Terms of Service — Smiling West Java',
    description: 'Terms of Service for Smiling West Java — West Java Tourism Repository. Compliant with Indonesian electronic transaction regulations.',
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <Header />

            <main className="pt-32 pb-20 px-6 md:px-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold mb-4">
                            Legal Document
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Last updated: February 21, 2025
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900">

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">1. Acceptance of Terms</h2>
                            <p className="leading-relaxed">
                                By accessing or using the Smiling West Java website (<strong>smilingwestjava.official.id</strong>), you agree to be bound by these Terms of Service.
                                This website is operated by the <strong>Dinas Pariwisata dan Kebudayaan Provinsi Jawa Barat</strong> (West Java Provincial Tourism and Culture Office)
                                as an official government tourism data repository.
                            </p>
                            <p className="leading-relaxed">
                                These Terms are governed by the laws of the Republic of Indonesia, including but not limited to:
                            </p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span><strong>Undang-Undang No. 11 Tahun 2008</strong> — tentang Informasi dan Transaksi Elektronik (ITE Law), as amended by <strong>UU No. 1 Tahun 2024</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span><strong>Undang-Undang No. 27 Tahun 2022</strong> — tentang Perlindungan Data Pribadi (Personal Data Protection Law / UU PDP)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span><strong>Peraturan Pemerintah No. 71 Tahun 2019</strong> — tentang Penyelenggaraan Sistem dan Transaksi Elektronik (PP PSTE)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span><strong>Undang-Undang No. 10 Tahun 2009</strong> — tentang Kepariwisataan (Tourism Law)</span>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">2. Definitions</h2>
                            <div className="space-y-3 mt-4">
                                {[
                                    { term: '"Website"', def: 'refers to the Smiling West Java platform at smilingwestjava.official.id' },
                                    { term: '"User"', def: 'refers to any individual or entity accessing or using the Website' },
                                    { term: '"Registered User"', def: 'refers to a User who has created an account on the Website' },
                                    { term: '"Dashboard"', def: 'refers to the restricted area of the Website accessible only to Registered Users' },
                                    { term: '"Tourism Data"', def: 'refers to statistical, analytical, and informational content related to West Java tourism' },
                                    { term: '"Operator"', def: 'refers to Dinas Pariwisata dan Kebudayaan Provinsi Jawa Barat' },
                                ].map((item) => (
                                    <div key={item.term} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <span className="font-mono text-sm font-bold text-[#F8BC16] whitespace-nowrap">{item.term}</span>
                                        <span className="text-gray-600">— {item.def}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">3. User Accounts</h2>
                            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">3.1 Registration</h3>
                            <p className="leading-relaxed">
                                To access the Dashboard and certain features, Users must register an account using a valid email address or Google Single Sign-On (SSO).
                                Upon registration, Users must select a role that reflects their organizational affiliation.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">3.2 Account Responsibilities</h3>
                            <p className="leading-relaxed">Users are responsible for:</p>
                            <ul className="space-y-2 mt-3">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>Maintaining the confidentiality of their login credentials</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>Providing accurate and up-to-date registration information</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>All activities conducted under their account</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#F8BC16] font-bold mt-1">•</span>
                                    <span>Immediately reporting any unauthorized access to their account</span>
                                </li>
                            </ul>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">3.3 Account Termination</h3>
                            <p className="leading-relaxed">
                                The Operator reserves the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activities, or misuse the platform.
                                As required by <strong>UU PDP Article 25</strong>, Users will be notified prior to any account termination and given the opportunity to retrieve their data.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">4. Acceptable Use</h2>
                            <p className="leading-relaxed">When using the Website, you agree <strong>NOT</strong> to:</p>
                            <div className="mt-4 p-6 bg-red-50/50 rounded-xl border border-red-100">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 font-bold mt-0.5">✕</span>
                                        <span>Use the Website for any unlawful purpose or in violation of Indonesian law</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 font-bold mt-0.5">✕</span>
                                        <span>Attempt unauthorized access to any restricted area of the Website</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 font-bold mt-0.5">✕</span>
                                        <span>Scrape, harvest, or extract data using automated means without prior written consent</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 font-bold mt-0.5">✕</span>
                                        <span>Distribute malware, viruses, or any harmful code through the Website</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 font-bold mt-0.5">✕</span>
                                        <span>Misrepresent your identity, role, or organizational affiliation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 font-bold mt-0.5">✕</span>
                                        <span>Use tourism data for commercial purposes without proper authorization</span>
                                    </li>
                                </ul>
                            </div>
                            <p className="leading-relaxed mt-4">
                                Violations may result in account suspension and potential legal action under <strong>UU ITE</strong> and related regulations.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">5. Intellectual Property</h2>
                            <p className="leading-relaxed">
                                All content, designs, logos, trademarks, and tourism data on this Website are the property of the
                                <strong> Dinas Pariwisata dan Kebudayaan Provinsi Jawa Barat</strong> or their respective owners, and are protected under
                                <strong> Undang-Undang No. 28 Tahun 2014</strong> (Copyright Law).
                            </p>
                            <p className="leading-relaxed">
                                Users may access and view tourism data for official, educational, and research purposes. Any reproduction, distribution,
                                or commercial use of the content requires prior written authorization from the Operator.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">6. Data Protection</h2>
                            <p className="leading-relaxed">
                                The collection, processing, and storage of personal data is governed by our{' '}
                                <a href="/privacy-policy" className="text-[#F8BC16] font-semibold hover:underline">Privacy Policy</a>,
                                which complies with <strong>UU PDP No. 27 Tahun 2022</strong>.
                            </p>
                            <p className="leading-relaxed">
                                By creating an account, you consent to the processing of your personal data as described in our Privacy Policy.
                                You may withdraw your consent at any time by contacting us or deleting your account.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">7. Disclaimers</h2>
                            <div className="p-6 bg-amber-50/50 rounded-xl border border-amber-100">
                                <p className="leading-relaxed text-gray-700">
                                    The Website and tourism data are provided <strong>&quot;as is&quot;</strong> without warranties of any kind.
                                    While we endeavor to ensure accuracy, the Operator does not guarantee the completeness, reliability, or timeliness of the tourism data.
                                    The Operator shall not be liable for any decisions made based on the data provided through this platform.
                                </p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">8. Limitation of Liability</h2>
                            <p className="leading-relaxed">
                                To the maximum extent permitted by Indonesian law, the Operator shall not be liable for any indirect, incidental, special,
                                consequential, or punitive damages arising from your use of or inability to use the Website or its services.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">9. Governing Law and Dispute Resolution</h2>
                            <p className="leading-relaxed">
                                These Terms shall be governed by and construed in accordance with the laws of the Republic of Indonesia.
                                Any disputes arising from or related to these Terms shall be resolved through:
                            </p>
                            <ol className="space-y-3 mt-4 list-decimal list-inside">
                                <li className="text-gray-600"><strong>Amicable negotiation</strong> between the parties within 30 days</li>
                                <li className="text-gray-600"><strong>Mediation</strong> through a mutually agreed-upon mediator</li>
                                <li className="text-gray-600"><strong>Arbitration or litigation</strong> at the District Court of Bandung (<em>Pengadilan Negeri Bandung</em>), West Java</li>
                            </ol>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">10. Changes to Terms</h2>
                            <p className="leading-relaxed">
                                The Operator reserves the right to modify these Terms at any time. Users will be notified of material changes via email or a notice on the Website.
                                Continued use of the Website after such changes constitutes acceptance of the updated Terms.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">11. Contact Information</h2>
                            <p className="leading-relaxed">
                                For questions regarding these Terms of Service, please contact:
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
