export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="text-6xl md:text-7xl mb-4">📜</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Please read these terms carefully before using our matchmaking service.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-blue-100 space-y-8">
            {/* Agreement */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using Toronto Jewish Matchmaker ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Service Description</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Toronto Jewish Matchmaker is an AI-powered matchmaking service designed to connect marriage-minded individuals within the Toronto Jewish community. Our service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Uses AI technology to analyze compatibility and identify potential matches</li>
                <li>Proactively searches for potential matches using publicly available information</li>
                <li>Facilitates introductions between compatible individuals</li>
                <li>Provides a platform for meaningful connections within the community</li>
              </ul>
            </section>

            {/* No Guarantees - Ethical Marketing */}
            <section className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">No Guarantees</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Important:</strong> We work hard to find compatible matches for our members, but we cannot guarantee:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>That you will find a match</li>
                <li>That any match will lead to a relationship or marriage</li>
                <li>Specific timelines for finding matches</li>
                <li>The success of any relationship formed through our service</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Our service is a tool to help you meet compatible people. The success of any relationship depends on many factors beyond our control. We are committed to providing quality matches, but outcomes cannot be guaranteed.
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">User Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">As a user of our Service, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide accurate, truthful, and complete information in your profile</li>
                <li>Use the Service only for its intended purpose (finding serious, marriage-minded matches)</li>
                <li>Treat other members with respect and kindness</li>
                <li>Maintain the confidentiality of any contact information shared with you through matches</li>
                <li>Report any inappropriate behavior or concerns to us</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use the Service for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            {/* Acceptable Use Policy */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Acceptable Use Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide false, misleading, or fraudulent information</li>
                <li>Impersonate another person or entity</li>
                <li>Harass, abuse, or harm other members</li>
                <li>Use the Service to promote commercial activities or spam</li>
                <li>Attempt to gain unauthorized access to our systems or data</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Share contact information of matches with third parties without consent</li>
              </ul>
            </section>

            {/* Profile Content */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Profile Content</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are responsible for all content you submit to the Service, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Profile information and photos</li>
                <li>Responses to compatibility questions</li>
                <li>Any communications sent through the Service</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You represent that all content you provide is accurate, does not violate any third-party rights, and complies with these Terms. We reserve the right to review, edit, or remove any content that violates these Terms.
              </p>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of the Service is also governed by our{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                . Please review it to understand how we collect, use, and protect your information.
              </p>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Service Availability</h2>
              <p className="text-gray-700 leading-relaxed">
                We strive to provide reliable service, but we do not guarantee that the Service will be available at all times. We may experience downtime, maintenance, or technical issues. We reserve the right to modify, suspend, or discontinue the Service at any time with or without notice.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>The Service is provided "as is" without warranties of any kind</li>
                <li>We are not liable for any damages arising from your use of the Service</li>
                <li>We are not responsible for the actions, behavior, or conduct of other members</li>
                <li>We are not liable for any outcomes of relationships formed through the Service</li>
                <li>Our total liability is limited to the amount you paid for the Service (currently $0, as the Service is free)</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Service, including its design, features, and content, is owned by Toronto Jewish Matchmaker and protected by intellectual property laws. You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Copy, modify, or distribute any part of the Service</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use our trademarks or branding without permission</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, if you violate these Terms or engage in any conduct we deem inappropriate. You may also terminate your account at any time by contacting us.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms of Service from time to time. We will notify you of any material changes by posting the updated terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of Ontario, Canada, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these Terms of Service, please contact us:
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

