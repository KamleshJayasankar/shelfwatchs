import { useEffect, useState } from 'react';

const categories = ['Biscuits', 'Chocolate', 'Chips', 'Other'];

const emptyForm = {
  name: '',
  category: 'Biscuits',
  quantity: '',
  unitPrice: '',
  purchaseDate: '',
  expiryDate: ''
};

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const ProductForm = ({ product, onCancel, onSubmit, isSaving }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        category: product.category || 'Biscuits',
        quantity: product.quantity ?? '',
        unitPrice: product.unitPrice ?? '',
        purchaseDate: toDateInput(product.purchaseDate),
        expiryDate: toDateInput(product.expiryDate)
      });
    } else {
      setForm(emptyForm);
    }
  }, [product]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice)
    });
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-slate-950/40 p-0 sm:items-center sm:justify-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-t-lg bg-white p-4 shadow-xl sm:max-w-2xl sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">{product ? 'Edit product' : 'Add product'}</h2>
          <button type="button" onClick={onCancel} className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Close
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Name
            <input name="name" value={form.name} onChange={updateField} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Category
            <select name="category" value={form.category} onChange={updateField} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Quantity
            <input name="quantity" value={form.quantity} onChange={updateField} required min="0" type="number" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Unit price
            <input name="unitPrice" value={form.unitPrice} onChange={updateField} required min="0" step="0.01" type="number" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Purchase date
            <input name="purchaseDate" value={form.purchaseDate} onChange={updateField} required type="date" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Expiry date
            <input name="expiryDate" value={form.expiryDate} onChange={updateField} required type="date" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Cancel
          </button>
          <button disabled={isSaving} className="rounded-md bg-shelf-mint px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {isSaving ? 'Saving...' : 'Save product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
