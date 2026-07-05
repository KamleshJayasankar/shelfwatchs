const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
});

const getExpiryStatus = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (days < 0) return { label: 'Expired', className: 'row-expired' };
  if (days <= 7) return { label: `${days} day${days === 1 ? '' : 's'}`, className: 'row-expiring7' };
  if (days <= 30) return { label: `${days} days`, className: 'row-expiring30' };
  return { label: 'Fresh', className: 'row-fresh' };
};

const ProductTable = ({ products, onEdit, onDelete, canDelete }) => {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
        No products match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Purchase</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((product) => {
              const status = getExpiryStatus(product.expiryDate);
              return (
                <tr key={product._id} className={status.className}>
                  <td className="px-4 py-3 font-semibold text-slate-950">{product.name}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{product.quantity}</td>
                  <td className="px-4 py-3">{currency.format(product.unitPrice)}</td>
                  <td className="px-4 py-3">{new Date(product.purchaseDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(product.expiryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-semibold">{status.label}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onEdit(product)} className="rounded-md px-3 py-1.5 text-sm font-semibold text-shelf-mint hover:bg-white/70">
                      Edit
                    </button>
                    {canDelete && (
                      <button onClick={() => onDelete(product)} className="ml-2 rounded-md px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-white/70">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-200 md:hidden">
        {products.map((product) => {
          const status = getExpiryStatus(product.expiryDate);
          return (
            <article key={product._id} className={`${status.className} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{product.name}</h3>
                  <p className="text-sm text-slate-600">{product.category}</p>
                </div>
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold">{status.label}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-slate-500">Qty</dt>
                  <dd className="font-semibold">{product.quantity}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Price</dt>
                  <dd className="font-semibold">{currency.format(product.unitPrice)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Purchase</dt>
                  <dd className="font-semibold">{new Date(product.purchaseDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Expiry</dt>
                  <dd className="font-semibold">{new Date(product.expiryDate).toLocaleDateString()}</dd>
                </div>
              </dl>
              <div className="mt-3 flex gap-2">
                <button onClick={() => onEdit(product)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-shelf-mint">
                  Edit
                </button>
                {canDelete && (
                  <button onClick={() => onDelete(product)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-rose-700">
                    Delete
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ProductTable;
