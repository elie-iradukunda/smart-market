export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 sm:py-24">
        <div className="container-professional">
          <div className="mx-auto max-w-3xl prose prose-lg prose-gray">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                By accessing and using TOP Design services, you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Permission is granted to temporarily access and use TOP Design for business purposes. This is the
                grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose without explicit permission</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or other proprietary notations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You are responsible for maintaining the confidentiality of your account credentials and for all
                activities that occur under your account. You agree to immediately notify us of any unauthorized
                use of your account.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable except
                as required by law. We reserve the right to change our pricing with 30 days notice.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Service Availability</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. We reserve the right
                to perform maintenance that may result in temporary service interruptions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                In no event shall TOP Design be liable for any damages arising out of the use or inability to use
                our services, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                Questions about the Terms of Service should be sent to us at{' '}
                <a href="mailto:legal@topdesign.com" className="text-primary-600 hover:text-primary-700">
                  legal@topdesign.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

