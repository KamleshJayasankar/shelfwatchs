import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';
import { createProduct, deleteProduct, getProductStats, getProducts, updateProduct } from '../api/products';
import { getInsights } from '../api/ai';
import { useAuth } from '../context/AuthContext';

const categories = ['', 'Biscuits', 'Chocolate', 'Chips', 'Dairy', 'Beverages', 'Staples', 'Other'];
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const actionLabels = {
  discount: 'Discount',
  bundle: 'Bundle',
  move_to_front: 'Move to front',
  return_to_supplier: 'Return to supplier',
  remove: 'Remove'
};
const statuses = [
  { value: '', label: 'All stock' },
  { value: 'expired', label: 'Expired' },
  { value: '7-day', label: 'Expiring in 7 days' },
  { value: '30-day', label: 'Expiring in 30 days' },
  { value: 'fresh', label: 'Fresh' }
];

const statCards = [
  { key: 'expired', label: 'Expired', tone: 'border-rose-200 bg-rose-50 text-rose-800' },
  { key: 'expiring7Days', label: 'Expiring 7 days', tone: 'border-orange-200 bg-orange-50 text-orange-800' },
  { key: 'expiring30Days', label: 'Expiring 30 days', tone: 'border-yellow-200 bg-yellow-50 text-yellow-800' },
  { key: 'fresh', label: 'Fresh', tone: 'border-green-200 bg-green-50 text-green-800' }
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ expired: 0, expiring7Days: 0, expiring30Days: 0, fresh: 0, valueAtRisk: 0 });
  const [filters, setFilters] = useState({ category: '', status: '', search: '', sort: 'asc' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [plan, setPlan] = useState(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  const params = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '')),
    [filters]
  );

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [productResponse, statsResponse] = await Promise.all([getProducts(params), getProductStats()]);
      setProducts(productResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [params]);

  const loadPlan = async () => {
    setIsPlanLoading(true);
    try {
      const { data } = await getInsights();
      setPlan(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not generate the action plan');
    } finally {
      setIsPlanLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (payload) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product added');
      }
      setIsFormOpen(false);
      setEditingProduct(null);
      await loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(`Delete ${product.name}?`);
    if (!confirmed) return;

    try {
      await deleteProduct(product._id);
      toast.success('Product deleted');
      await loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete product');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-shelf-mint">ShelfWatch</p>
            <h1 className="text-2xl font-bold text-slate-950">Inventory dashboard</h1>
            <p className="text-sm text-slate-600">{user?.name} · {user?.role}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadPlan} disabled={isPlanLoading} className="rounded-md border border-slate-900 bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60">
              {isPlanLoading ? 'Thinking...' : 'AI action plan'}
            </button>
            <button onClick={openCreateForm} className="rounded-md bg-shelf-mint px-4 py-2 text-sm font-semibold text-white">
              Add product
            </button>
            <button onClick={logout} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5">
        <article className="mb-3 rounded-lg border border-rose-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-600">Value at risk (expired + expiring in 7 days)</p>
          <p className="mt-1 text-3xl font-bold text-rose-700">{inr.format(stats.valueAtRisk || 0)}</p>
        </article>

        {plan && (
          <article className="mb-3 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-950">AI action plan</h2>
              <button onClick={() => setPlan(null)} className="text-sm text-slate-500 hover:text-slate-800">Dismiss</button>
            </div>
            <p className="mt-1 text-sm text-slate-700">{plan.summary}</p>
            <ul className="mt-3 space-y-2">
              {plan.actions.map((item) => (
                <li key={item.name} className="rounded-md bg-slate-50 p-3 text-sm">
                  <span className="font-semibold text-slate-900">{item.name}</span>{' '}
                  <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                    {actionLabels[item.action]}{item.discountPercent ? ` ${item.discountPercent}%` : ''}
                  </span>
                  <p className="mt-1 text-slate-600">{item.reason}</p>
                </li>
              ))}
            </ul>
          </article>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.key} className={`rounded-lg border p-4 ${card.tone}`}>
              <p className="text-sm font-semibold">{card.label}</p>
              <p className="mt-2 text-3xl font-bold">{stats[card.key]}</p>
            </article>
          ))}
        </div>

        <div className="my-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1.4fr_1fr_1fr_auto]">
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Search by product name"
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          <select
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category || 'All categories'}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="asc">Nearest expiry</option>
            <option value="desc">Latest expiry</option>
          </select>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">Loading inventory...</div>
        ) : (
          <ProductTable
            products={products}
            canDelete={user?.role === 'admin'}
            onEdit={(product) => {
              setEditingProduct(product);
              setIsFormOpen(true);
            }}
            onDelete={handleDeleteProduct}
          />
        )}
      </section>

      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          isSaving={isSaving}
          onSubmit={handleSaveProduct}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </main>
  );
};

export default Dashboard;
