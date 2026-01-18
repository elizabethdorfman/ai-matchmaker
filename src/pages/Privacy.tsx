export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="text-6xl md:text-7xl mb-4">🔒</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-blue-100 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Toronto Jewish Matchmaker ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our matchmaking service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Information You Provide</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Personal information (name, age, location, email, phone number)</li>
                    <li>Religious background and observance level</li>
                    <li>Education and career information</li>
                    <li>Values, beliefs, and lifestyle preferences</li>
                    <li>Relationship goals and deal-breakers</li>
                    <li>Photos and profile information</li>
                    <li>Any other information you choose to provide in your profile</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Usage data and interaction with our service</li>
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use AI Sourcing */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">How We Use AI Sourcing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our service uses AI technology to proactively find potential matches for our members. Here's how it works:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>We analyze your profile to create matching criteria (age, location, interests, values, etc.)</li>
                <li>Our AI searches publicly available information on social media platforms (Instagram, LinkedIn, Facebook) and professional networks</li>
                <li>We identify potential matches based on compatibility factors and Jewish community indicators</li>
                <li>We may reach out to potential matches via direct message to invite them to our service</li>
                <li>We only use publicly available information and respect platform terms of service</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>Transparency:</strong> If we contact you through social media, we will always identify ourselves and explain how we found you. You can opt out at any time.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Create and maintain your profile</li>
                <li>Match you with compatible partners using our AI-powered algorithm</li>
                <li>Contact you about potential matches</li>
                <li>Send you service-related communications</li>
                <li>Improve our matching algorithm and service quality</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We respect your privacy. Your information is shared only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>With Matched Partners:</strong> When we identify a compatible match, we share profile summaries and contact information with both parties (only after mutual interest is confirmed)</li>
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist in operating our service (e.g., email services, hosting providers)</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>We do not sell your personal information.</strong> Your data is used solely for matchmaking purposes.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from communications or opt out of AI sourcing</li>
                <li><strong>Data Portability:</strong> Request your data in a portable format</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:yourpersonalaimatchmaker@gmail.com" className="text-blue-600 hover:underline">
                  yourpersonalaimatchmaker@gmail.com
                </a>
              </p>
            </section>

            {/* GDPR/CCPA Compliance */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">GDPR and CCPA Compliance</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are located in the European Economic Area (EEA) or California, you have additional rights under GDPR and CCPA:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Right to object to processing of your personal data</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to lodge a complaint with a supervisory authority (GDPR)</li>
                <li>Right to know what personal information is collected (CCPA)</li>
                <li>Right to know if personal information is sold or disclosed (CCPA)</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We may use cookies and similar tracking technologies to improve your experience on our website. You can control cookie preferences through your browser settings.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our service is intended for adults 18 years and older. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our service after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong>{' '}
                <a href="mailto:yourpersonalaimatchmaker@gmail.com" className="text-blue-600 hover:underline">
                  yourpersonalaimatchmaker@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

