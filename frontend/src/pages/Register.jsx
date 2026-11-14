import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await register(form);
      toast.success('Account created');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Create your shop account. You will be the shop admin.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Name
          <input name="name" value={form.name} onChange={updateField} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" required />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input name="email" type="email" value={form.email} onChange={updateField} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" required />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input name="password" type="password" minLength="6" value={form.password} onChange={updateField} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" required />
        </label>
        <button disabled={isLoading} className="w-full rounded-md bg-shelf-mint px-4 py-2.5 font-semibold text-white disabled:opacity-60">
          {isLoading ? 'Creating...' : 'Create account'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-shelf-mint">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
