import { Link } from "react-router";

const RefundPolicy = () => {
  return (
    <>
      <div className="max-w-4xl mx-auto p-6 space-grotesk">
        <h1 className="text-3xl font-bold mb-6 bai-jamjuree-bold">
          Refund Policy
        </h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 bai-jamjuree-semibold">
              Digital Service Refunds
            </h2>
            <p>
              Since we provide immediate digital access, we do provide refunds
              if requested .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 bai-jamjuree-semibold">
              Exception Cases
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Technical issues preventing service access that we cannot
                resolve
              </li>
              <li>Duplicate charges or billing errors</li>
              <li>Legal requirements in your jurisdiction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 bai-jamjuree-semibold">
              How to Request
            </h2>
            <p>
              Contact us within 24 hours of purchase at:
              ayushgairola2002@yourdomain.com
            </p>
            <p className="text-sm text-red-400 mt-2">
              * Include your purchase receipt and reason for refund request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 bai-jamjuree-semibold">
              Payment-partners Handling
            </h2>
            <p>All payments are processed by Payment-partners They handle:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payment security and compliance</li>
              <li>Invoice generation</li>
              <li>Tax calculations</li>
              {/* <li>Initial refund requests</li> */}
            </ul>
          </section>

          <div className="mt-8 p-4 bg-yellow-100 text-black rounded">
            <p className="text-sm">
              <strong>Note:</strong> This refund policy is designed for digital
              services. We recommend testing our free tier before upgrading to
              premium.
              <Link
                className="bai-jamjuree-semibold text-green-500 px-3"
                to="/Interface"
              >
                Try for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
