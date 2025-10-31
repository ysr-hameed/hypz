import { CreditCard, Download, Receipt } from 'lucide-react';

const Billing = () => {
  const invoices = [
    { id: 'INV-2024-003', date: '2024-03-01', amount: '₹245', status: 'paid' },
    { id: 'INV-2024-002', date: '2024-02-01', amount: '₹189', status: 'paid' },
    { id: 'INV-2024-001', date: '2024-01-01', amount: '₹0', status: 'paid' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your payment methods and invoices</p>
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-4">
            <CreditCard className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</p>
            </div>
          </div>
          <button className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition font-medium">
            Update
          </button>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{invoice.date}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                      <Download size={16} className="mr-1" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
