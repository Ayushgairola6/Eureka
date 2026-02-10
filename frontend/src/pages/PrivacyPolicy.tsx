import { Link } from "react-router";

const PrivacyPolicy = () => {
  return (
    <>
      <div className="max-w-4xl mx-auto p-6 space-grotesk">
        <h1 className="text-3xl font-bold mb-6 bai-jamjuree-bold">
          Privacy Policy
        </h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 bai-jamjuree-semibold">
              What We Store
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Data:</strong> Email, user ID for authentication
              </li>
              <li>
                <strong>Usage Data:</strong> Query counts, timestamps for rate
                limiting
              </li>
              <li>
                <strong>Payment Data:</strong> Handled securely by Payment
                partners (we don't store payment info, except transaction
                information for smooth refund process)
              </li>
              <Link className="text-sm text-blue-500" to="/Refund-Policy">
                View Refund Policy
              </Link>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 bai-jamjuree-semibold">
              How We Use Your Data
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                To enhance your experience and personalizing your dashboard
              </li>
              <li>Make the AntiNode AI responses accurate</li>
              <li>Enforce rate limits and prevent abuse</li>
              <li>We do not use your data to train our internal models</li>
              <li>Send important service updates via email</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 bai-jamjuree-semibold">
              Data Sharing
            </h2>
            <p>We don't sell your data. We only share with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Payment partners:</strong> For payment processing
              </li>
              <li>
                <strong>AI Providers:</strong> To process your queries (Third
                party AI models currently)
              </li>
              {/* <li>
                <strong>Legal Requirements:</strong> When required by law
              </li> */}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 bai-jamjuree-semibold">
              Your Rights
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 bai-jamjuree-semibold">
              Contact
            </h2>
            <p>For privacy concerns: Ayushgairola200@gmail.com</p>
          </section>
        </div>
        <div className="mt-8 p-4 bg-yellow-100 text-black rounded">
          <p className="text-sm">
            <strong>Note:</strong> If you have any questions regarding any of
            the mentioned points you can email us at ayushgairola2002@gmail.com
            or send you feedback at{" "}
            <Link
              to="/Feedback"
              className="text-blue-500 text-sm bai-jamjuree-regular"
            >
              AntiNodeFeedback form
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
