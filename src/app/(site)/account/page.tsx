export const metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Invoices</h1>
      <p className="mt-2 text-navy/70">
        After your account is created, invoices appear here. Pay redirects to Stripe.
      </p>
      <div className="mt-8 overflow-x-auto rounded border border-navy/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-8 text-navy/60" colSpan={4}>
                No invoices yet. This table will load from the customer account.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
