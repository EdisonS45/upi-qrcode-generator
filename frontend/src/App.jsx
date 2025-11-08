import React, {
    useState,
    useEffect,
    createContext,
    useContext,
    useMemo,
    useCallback,
} from 'react';

// --- ICONS (using Heroicons) ---
// In a real app, you'd import these from '@heroicons/react'
const HomeIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6-4a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1z" /></svg>;
const DocumentTextIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CogIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5 mr-2 inline-block -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const ChevronLeftIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const LogoIcon = () => <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v0m0 10v-2m0 2v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckCircleIcon = () => <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- CONSTANTS ---
const API_URL = 'http://localhost:5001'; // Your backend URL
const TAILWIND_STYLES = {
    formInput: "form-input w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent",
    formLabel: "form-label block mb-2 text-sm font-medium text-brand-dark",
    btn: "btn inline-block px-6 py-3 rounded-lg text-base font-semibold text-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    btnPrimary: "btn-primary bg-brand-blue text-white hover:bg-brand-blue/90",
    btnSecondary: "btn-secondary bg-gray-100 text-brand-dark border border-gray-200 hover:bg-gray-200",
    wiseCard: "wise-card bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden",
};

// --- 1. AUTH CONTEXT ---
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Effect to load user profile if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await fetch(`${API_URL}/api/users/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData);
                    } else {
                        // Token is invalid
                        setToken(null);
                        localStorage.removeItem('token');
                    }
                } catch (error) {
                    console.error('Error loading user:', error);
                    setToken(null);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
            setUser(data);
            setToken(data.token);
            localStorage.setItem('token', data.token);
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
    };

    const register = async (name, email, password) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (res.ok) {
            setUser(data);
            setToken(data.token);
            localStorage.setItem('token', data.token);
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
    };

    const authContextValue = useMemo(() => ({
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
    }), [user, token, loading]);

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

// --- 2. API HELPER (with Auth) ---
// Custom fetch hook
const useApi = () => {
    const { token, logout } = useAuth();

    const apiFetch = useCallback(async (endpoint, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

        if (res.status === 401) {
            // Token expired or invalid
            logout();
            throw new Error('Unauthorized');
        }
        
        return res;

    }, [token, logout]);
    
    return apiFetch;
};


// --- 3. UTILITY COMPONENTS ---

const Spinner = () => (
    <div className="flex justify-center items-center py-10">
        <div className="spinner border-4 border-gray-200 border-t-brand-blue rounded-full w-10 h-10 animate-spin"></div>
    </div>
);

const Logo = () => (
    <div className="flex items-center mb-8">
        <LogoIcon />
        <span className="ml-2 text-xl font-bold text-brand-dark">PayGen</span>
    </div>
);

const FormInput = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className={TAILWIND_STYLES.formLabel}>
            {label}
        </label>
        <input id={id} {...props} className={TAILWIND_STYLES.formInput} />
    </div>
);

const Button = ({ children, variant = 'primary', ...props }) => (
    <button
        {...props}
        className={`${TAILWIND_STYLES.btn} ${variant === 'primary' ? TAILWIND_STYLES.btnPrimary : TAILWIND_STYLES.btnSecondary} ${props.className || ''}`}
    >
        {children}
    </button>
);

const formatCurrency = (num) => {
    if (typeof num !== 'number') {
        num = 0;
    }
    return `₹${num.toFixed(2)}`;
};

// --- 4. PAGE COMPONENTS ---

// === LOGIN PAGE ===
const LoginPage = ({ setPage }) => {
    const [email, setEmail] = useState('demo@paygen.com');
    const [password, setPassword] = useState('demopassword');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { success, message } = await login(email, password);
        if (!success) {
            setError(message || 'Login failed. Please check your credentials.');
        }
        // AuthProvider will handle user state update and trigger redirect
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-gray p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center items-center mb-6">
                    <LogoIcon />
                    <span className="ml-2 text-2xl font-bold text-brand-dark">PayGen</span>
                </div>
                <div className={`${TAILWIND_STYLES.wiseCard} p-8`}>
                    <h1 className="text-2xl font-bold text-brand-dark text-center mb-6">Welcome back</h1>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormInput
                            label="Email address"
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <FormInput
                            label="Password"
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log in'}
                        </Button>
                    </form>
                    <p className="text-center text-sm text-brand-text mt-6">
                        Don't have an account?{' '}
                        <button onClick={() => setPage('register')} className="font-medium text-brand-blue hover:underline">
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

// === REGISTER PAGE ===
const RegisterPage = ({ setPage }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { success, message } = await register(name, email, password);
        if (!success) {
            setError(message || 'Registration failed. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-gray p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center items-center mb-6">
                    <LogoIcon />
                    <span className="ml-2 text-2xl font-bold text-brand-dark">PayGen</span>
                </div>
                <div className={`${TAILWIND_STYLES.wiseCard} p-8`}>
                    <h1 className="text-2xl font-bold text-brand-dark text-center mb-6">Create your account</h1>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormInput
                            label="Your Name"
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <FormInput
                            label="Email address"
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <FormInput
                            label="Password"
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating account...' : 'Sign up'}
                        </Button>
                    </form>
                    <p className="text-center text-sm text-brand-text mt-6">
                        Already have an account?{' '}
                        <button onClick={() => setPage('login')} className="font-medium text-brand-blue hover:underline">
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- 5. DASHBOARD COMPONENTS ---

// === SIDEBAR ===
const Sidebar = ({ subpage, setSubpage }) => {
    const { logout } = useAuth();

    const NavLink = ({ page, icon, children }) => (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setSubpage(page);
                }}
                className={`nav-link flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    subpage === page
                        ? 'bg-brand-blue/10 text-brand-blue'
                        : 'text-brand-text hover:bg-gray-100'
                }`}
            >
                {icon}
                {children}
            </a>
        </li>
    );

    return (
        <nav className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col shrink-0">
            <Logo />
            <ul className="space-y-2">
                <NavLink page="home" icon={<HomeIcon />}>Home</NavLink>
                <NavLink page="invoices" icon={<DocumentTextIcon />}>Invoices</NavLink>
                <NavLink page="settings" icon={<CogIcon />}>Settings</NavLink>
            </ul>
            <div className="mt-auto">
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        logout();
                    }}
                    className="nav-link flex items-center px-4 py-3 rounded-lg font-medium text-brand-text hover:bg-gray-100"
                >
                    <LogoutIcon />
                    Logout
                </a>
            </div>
        </nav>
    );
};

// === SUBPAGE: HOME ===
const HomePage = ({ setPage, setSubpage }) => {
    const { user } = useAuth();
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiFetch = useApi();

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await apiFetch('/api/invoices');
                if (res.ok) {
                    const data = await res.json();
                    setRecentInvoices(data.slice(0, 3)); // Get most recent 3
                }
            } catch (error) {
                console.error('Failed to fetch invoices', error);
            }
            setLoading(false);
        };
        fetchInvoices();
    }, [apiFetch]);

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-brand-dark">Welcome back, {user?.name}</h1>
                <p className="text-lg text-brand-text mt-1">Here's your financial overview.</p>
            </header>

            {/* In a real app, these stats would come from an aggregate API endpoint */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`${TAILWIND_STYLES.wiseCard} p-6`}>
                    <h2 className="text-sm font-medium text-brand-text mb-1">Total Revenue</h2>
                    <p className="text-3xl font-bold text-brand-dark">₹--</p>
                    <p className="text-sm text-brand-text mt-1">Data not available</p>
                </div>
                <div className={`${TAILWIND_STYLES.wiseCard} p-6`}>
                    <h2 className="text-sm font-medium text-brand-text mb-1">Invoices Sent</h2>
                    <p className="text-3xl font-bold text-brand-dark">{recentInvoices.length}</p>
                    <p className="text-sm text-brand-text mt-1">In total</p>
                </div>
                <div className={`${TAILWIND_STYLES.wiseCard} p-6`}>
                    <h2 className="text-sm font-medium text-brand-text mb-1">Pending</h2>
                    <p className="text-3xl font-bold text-brand-dark">
                        {recentInvoices.filter(inv => inv.status === 'Pending').length}
                    </p>
                    <p className="text-sm text-brand-text mt-1">Awaiting payment</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-dark">Recent Invoices</h2>
                <Button onClick={() => setPage('new-invoice')}>
                    <PlusIcon />
                    New Invoice
                </Button>
            </div>
            
            <div className={TAILWIND_STYLES.wiseCard}>
                {loading ? (
                    <Spinner />
                ) : recentInvoices.length === 0 ? (
                    <p className="p-10 text-center text-brand-text">You haven't created any invoices yet.</p>
                ) : (
                    <InvoiceTable invoices={recentInvoices} />
                )}
            </div>
        </div>
    );
};

// === SUBPAGE: INVOICES ===
const InvoicesPage = ({ setPage }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const apiFetch = useApi();
    
    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/invoices');
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            } else {
                setError('Failed to fetch invoices.');
            }
        } catch (error) {
            console.error('Failed to fetch invoices', error);
            setError('An error occurred. Please try again.');
        }
        setLoading(false);
    }, [apiFetch]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-dark">Invoices</h1>
                <Button onClick={() => setPage('new-invoice')}>
                    <PlusIcon />
                    New Invoice
                </Button>
            </header>
            <div className={TAILWIND_STYLES.wiseCard}>
                {loading ? (
                    <Spinner />
                ) : error ? (
                     <p className="p-10 text-center text-red-500">{error}</p>
                ) : invoices.length === 0 ? (
                    <p className="p-10 text-center text-brand-text">You haven't created any invoices yet.</p>
                ) : (
                    <InvoiceTable invoices={invoices} onRefresh={fetchInvoices} />
                )}
            </div>
        </div>
    );
};

// === INVOICE TABLE (Used by Home & Invoices) ===
const InvoiceTable = ({ invoices }) => {
    const apiFetch = useApi();
    const { token } = useAuth(); // Need token for direct link

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Overdue':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Function to handle PDF download
    // This is tricky without a library, we stream the blob
    const downloadPdf = async (invoiceId, invoiceNumber) => {
        try {
            // We use apiFetch to handle auth
            const res = await apiFetch(`/api/invoices/${invoiceId}/pdf`);
            if (!res.ok) {
                throw new Error('Failed to download PDF');
            }
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Create a link to download it
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Invoice-${invoiceNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Could not download PDF.');
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-gray-200">
                    <tr>
                        <th className="p-4 text-sm font-medium text-brand-text">Client</th>
                        <th className="p-4 text-sm font-medium text-brand-text">Amount</th>
                        <th className="p-4 text-sm font-medium text-brand-text">Status</th>
                        <th className="p-4 text-sm font-medium text-brand-text">Date</th>
                        <th className="p-4 text-sm font-medium text-brand-text">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(invoice => (
                        <tr key={invoice._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-4 font-medium text-brand-dark">{invoice.clientName}</td>
                            <td className="p-4 text-brand-text">{formatCurrency(invoice.total)}</td>
                            <td className="p-4">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(invoice.status)}`}>
                                    {invoice.status}
                                </span>
                            </td>
                            <td className="p-4 text-brand-text">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</td>
                            <td className="p-4">
                                <button
                                    onClick={() => downloadPdf(invoice._id, invoice.invoiceNumber)}
                                    className="font-medium text-brand-blue hover:underline"
                                >
                                    Download PDF
                                </button>
                                {/* We can also provide a direct link which is easier */}
                                <a 
                                    href={`${API_URL}/api/invoices/${invoice._id}/pdf?token=${token}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-4 font-medium text-gray-600 hover:underline"
                                >
                                    View
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// === SUBPAGE: SETTINGS ===
const SettingsPage = () => {
    const { user, updateUser, token } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        businessName: '',
        email: '',
        gstin: '',
        upiId: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const apiFetch = useApi();

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                businessName: user.businessName || '',
                email: user.email || '',
                gstin: user.gstin || '',
                upiId: user.upiId || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await apiFetch('/api/users/profile', {
                method: 'PUT',
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                // Update local user state in context
                updateUser(data);
                setMessage('Profile updated successfully!');
            } else {
                setMessage(data.message || 'Failed to update profile.');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        }
        setLoading(false);
    };
    
    if (!user) return <Spinner />;

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-brand-dark">Settings</h1>
            </header>
            <div className={`${TAILWIND_STYLES.wiseCard} p-8 max-w-2xl`}>
                <h2 className="text-xl font-bold text-brand-dark mb-6">Business Details</h2>
                {message && <p className="text-green-600 text-center mb-4">{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Your Name"
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                        />
                         <FormInput
                            label="Your Business Name"
                            id="businessName"
                            type="text"
                            value={formData.businessName}
                            onChange={handleChange}
                        />
                        <FormInput
                            label="Account Email"
                            id="email"
                            type="email"
                            value={formData.email}
                            disabled
                            className={`${TAILWIND_STYLES.formInput} bg-gray-100 cursor-not-allowed`}
                        />
                        <FormInput
                            label="Your GSTIN"
                            id="gstin"
                            type="text"
                            value={formData.gstin}
                            onChange={handleChange}
                        />
                        <FormInput
                            label="Default UPI ID (VPA)"
                            id="upiId"
                            type="text"
                            value={formData.upiId}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mt-8 text-right">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// === NEW INVOICE PAGE ===
const NewInvoicePage = ({ setPage, setSubpage }) => {
    const { user } = useAuth();
    const apiFetch = useApi();
    
    // --- State ---
    const [yourDetails, setYourDetails] = useState({
        name: '',
        gst: '',
        upi: '',
    });
    const [clientDetails, setClientDetails] = useState({
        name: 'Tech Solutions Ltd.',
        gst: '29XYZAB9876C1Z9',
        address: '123 Innovation Drive, Bangalore, KA 560001',
    });
    const [invoiceNum, setInvoiceNum] = useState(`INV-${new Date().getFullYear()}-001`);
    const [lineItems, setLineItems] = useState([
        { id: 1, description: 'Web Development Services', qty: 10, rate: 5500 },
        { id: 2, description: 'Monthly Maintenance', qty: 1, rate: 15000 },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // --- Load user defaults ---
    useEffect(() => {
        if (user) {
            setYourDetails({
                name: user.businessName || user.name,
                gst: user.gstin,
                upi: user.upiId,
            });
        }
        // In a real app, you'd fetch the last invoice number + 1
    }, [user]);

    // --- Line Item Handlers ---
    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            { id: Date.now(), description: '', qty: 1, rate: 0 },
        ]);
    };

    const removeLineItem = (id) => {
        setLineItems(lineItems.filter(item => item.id !== id));
    };

    const handleItemChange = (id, field, value) => {
        setLineItems(lineItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    // --- Calculations ---
    const totals = useMemo(() => {
        const subtotal = lineItems.reduce((acc, item) => {
            const qty = parseFloat(item.qty) || 0;
            const rate = parseFloat(item.rate) || 0;
            return acc + (qty * rate);
        }, 0);
        
        const cgst = subtotal * 0.09;
        const sgst = subtotal * 0.09;
        const total = subtotal + cgst + sgst;
        
        return { subtotal, cgst, sgst, total };
    }, [lineItems]);
    
    // --- Form Submission ---
    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        
        const invoiceData = {
            invoiceNumber: invoiceNum,
            clientName: clientDetails.name,
            clientGst: clientDetails.gst,
            clientAddress: clientDetails.address,
            items: lineItems.map(item => ({
                description: item.description,
                qty: parseFloat(item.qty) || 0,
                rate: parseFloat(item.rate) || 0,
            })),
            subtotal: totals.subtotal,
            cgst: totals.cgst,
            sgst: totals.sgst,
            total: totals.total,
            status: 'Pending', // Default status
            invoiceDate: new Date().toISOString(),
        };

        try {
            const res = await apiFetch('/api/invoices', {
                method: 'POST',
                body: JSON.stringify(invoiceData),
            });
            
            if (res.ok) {
                // Success
                setShowSuccessModal(true);
            } else {
                const errData = await res.json();
                setError(errData.message || 'Failed to create invoice.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
        setLoading(false);
    };
    
    // --- Success Modal ---
    if (showSuccessModal) {
        return (
            <div className="fixed inset-0 bg-brand-dark/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className={`${TAILWIND_STYLES.wiseCard} p-8 text-center max-w-md`}>
                    <CheckCircleIcon />
                    <h2 className="text-2xl font-bold text-brand-dark mt-4 mb-2">Invoice Created!</h2>
                    <p className="text-brand-text mb-6">Your new invoice has been saved successfully.</p>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={() => {
                            setShowSuccessModal(false);
                            setPage('dashboard');
                            setSubpage('invoices');
                        }} className="w-full">
                            View All Invoices
                        </Button>
                         <Button onClick={() => setShowSuccessModal(false)} className="w-full">
                            Create Another
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Render ---
    return (
        <div className="min-h-screen bg-brand-gray">
            <nav className="bg-white border-b border-gray-200 px-6 sm:px-10 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center">
                    <button
                        className="text-brand-text hover:text-brand-dark mr-4"
                        onClick={() => setPage('dashboard')}
                    >
                        <ChevronLeftIcon />
                    </button>
                    <h1 className="text-xl font-bold text-brand-dark">Create New Invoice</h1>
                </div>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Saving...' : 'Save & Create Invoice'}
                </Button>
            </nav>

            <div className="p-6 sm:p-10 max-w-6xl mx-auto">
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Your Details */}
                        <div className={TAILWIND_STYLES.wiseCard}>
                            <h2 className="text-lg font-bold text-brand-dark mb-4 p-6 border-b border-gray-200">Your Details</h2>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormInput
                                    label="Your Name / Business"
                                    id="your-name"
                                    type="text"
                                    value={yourDetails.name}
                                    onChange={(e) => setYourDetails({...yourDetails, name: e.target.value})}
                                />
                                <FormInput
                                    label="Your GSTIN"
                                    id="your-gst"
                                    type="text"
                                    value={yourDetails.gst}
                                    onChange={(e) => setYourDetails({...yourDetails, gst: e.target.value})}
                                />
                                <FormInput
                                    label="Your UPI ID (VPA)"
                                    id="your-upi"
                                    type="text"
                                    value={yourDetails.upi}
                                    onChange={(e) => setYourDetails({...yourDetails, upi: e.target.value})}
                                />
                                <FormInput
                                    label="Invoice Number"
                                    id="invoice-num"
                                    type="text"
                                    value={invoiceNum}
                                    onChange={(e) => setInvoiceNum(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        {/* Client Details */}
                        <div className={TAILWIND_STYLES.wiseCard}>
                            <h2 className="text-lg font-bold text-brand-dark mb-4 p-6 border-b border-gray-200">Client Details</h2>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormInput
                                    label="Client's Business Name"
                                    id="client-name"
                                    type="text"
                                    value={clientDetails.name}
                                    onChange={(e) => setClientDetails({...clientDetails, name: e.target.value})}
                                />
                                <FormInput
                                    label="Client's GSTIN"
                                    id="client-gst"
                                    type="text"
                                    value={clientDetails.gst}
                                    onChange={(e) => setClientDetails({...clientDetails, gst: e.target.value})}
                                />
                                <div className="sm:col-span-2">
                                    <FormInput
                                        label="Client's Address"
                                        id="client-address"
                                        type="text"
                                        value={clientDetails.address}
                                        onChange={(e) => setClientDetails({...clientDetails, address: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className={TAILWIND_STYLES.wiseCard}>
                            <h2 className="text-lg font-bold text-brand-dark p-6 border-b border-gray-200">Invoice Items</h2>
                            <div className="p-6 space-y-4">
                                {/* Header for desktop */}
                                <div className="hidden md:grid grid-cols-12 gap-x-4 pb-2 border-b">
                                    <label className="col-span-5 form-label">Description</label>
                                    <label className="col-span-2 form-label">Qty</label>
                                    <label className="col-span-3 form-label">Rate</label>
                                    <label className="col-span-1 form-label">Total</label>
                                </div>
                                {/* Items */}
                                {lineItems.map(item => (
                                    <div key={item.id} className="line-item grid grid-cols-12 gap-x-4 gap-y-2 items-start md:items-center">
                                        <div className="col-span-12 md:col-span-5">
                                            <label className="form-label md:hidden">Description</label>
                                            <input
                                                type="text"
                                                className={TAILWIND_STYLES.formInput}
                                                placeholder="Item Description"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-4 md:col-span-2">
                                            <label className="form-label md:hidden">Qty</label>
                                            <input
                                                type="number"
                                                className={TAILWIND_STYLES.formInput}
                                                placeholder="Qty"
                                                value={item.qty}
                                                min="0"
                                                onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-8 md:col-span-3">
                                            <label className="form-label md:hidden">Rate</label>
                                            <input
                                                type="number"
                                                className={TAILWIND_STYLES.formInput}
                                                placeholder="Rate"
                                                value={item.rate}
                                                min="0"
                                                onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-10 md:col-span-1 flex items-center h-full pt-2 md:pt-0">
                                            <span className="font-medium text-brand-dark item-total">
                                                {formatCurrency((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0))}
                                            </span>
                                        </div>
                                        <div className="col-span-2 md:col-span-1 text-right flex items-center h-full">
                                            <button
                                                type="button"
                                                className="text-red-500 hover:text-red-700 p-2"
                                                onClick={() => removeLineItem(item.id)}
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="secondary" onClick={addLineItem}>
                                    <PlusIcon />
                                    Add Item
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column (Summary) */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className={`${TAILWIND_STYLES.wiseCard} p-6 sticky top-28`}>
                            <h2 className="text-lg font-bold text-brand-dark mb-4">Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-brand-text">Subtotal</span>
                                    <span className="font-medium text-brand-dark">{formatCurrency(totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-brand-text">CGST (9%)</span>
                                    <span className="font-medium text-brand-dark">{formatCurrency(totals.cgst)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-brand-text">SGST (9%)</span>
                                    <span className="font-medium text-brand-dark">{formatCurrency(totals.sgst)}</span>
                                </div>
                                <hr className="my-3 border-gray-200" />
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-bold text-brand-dark">Total Amount</span>
                                    <span className="font-bold text-brand-dark">{formatCurrency(totals.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};


// === DASHBOARD LAYOUT (Main App Shell) ===
const DashboardLayout = ({ setPage }) => {
    const [subpage, setSubpage] = useState('home'); // home, invoices, settings
    const { user } = useAuth();

    if (!user) {
        return <Spinner />; // Should not happen if App routing is correct
    }

    const renderSubpage = () => {
        switch (subpage) {
            case 'home':
                return <HomePage setPage={setPage} setSubpage={setSubpage} />;
            case 'invoices':
                return <InvoicesPage setPage={setPage} />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <HomePage setPage={setPage} setSubpage={setSubpage} />;
        }
    };

    return (
        <div className="flex h-screen bg-brand-gray">
            <Sidebar subpage={subpage} setSubpage={setSubpage} />
            <main className="flex-1 overflow-y-auto p-6 sm:p-10">
                {renderSubpage()}
            </main>
        </div>
    );
};

// --- 6. MAIN APP COMPONENT (Router) ---
function App() {
    const { user, loading } = useAuth();
    // Simple state-based router
    const [page, setPage] = useState('login'); // login, register, dashboard, new-invoice

    // Main router effect
    useEffect(() => {
        if (!loading) {
            if (user) {
                // If user is logged in, default to dashboard
                if (page === 'login' || page === 'register') {
                    setPage('dashboard');
                }
            } else {
                // If user is logged out, force login/register
                if (page !== 'register') {
                    setPage('login');
                }
            }
        }
    }, [user, loading, page]);
    
    // Show global spinner while checking auth
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-brand-gray">
                <Spinner />
            </div>
        );
    }

    // Main page router
    const renderPage = () => {
        if (!user) {
            switch (page) {
                case 'login':
                    return <LoginPage setPage={setPage} />;
                case 'register':
                    return <RegisterPage setPage={setPage} />;
                default:
                    return <LoginPage setPage={setPage} />;
            }
        }

        // --- Authenticated Pages ---
        switch (page) {
            case 'dashboard':
                return <DashboardLayout setPage={setPage} />;
            case 'new-invoice':
                return <NewInvoicePage setPage={setPage} setSubpage={() => {}} />; // setSubpage is stubbed
            default:
                return <DashboardLayout setPage={setPage} />;
        }
    };

    return (
        <div className="min-h-screen font-sans text-brand-text bg-brand-gray">
            {renderPage()}
        </div>
    );
}

// Wrap App in AuthProvider
export default function AppWrapper() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}