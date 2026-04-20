import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import { Settings as SettingsIcon, Shield, LogOut, Briefcase, ChevronDown} from 'lucide-react';
import { DOMAINS } from '../config/domains';
import PageTransition from '../components/PageTransition';

const CustomDropdown = ({ options, value, onChange }: { options: any[], value: string, onChange: (v: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.id === value)?.label || 'Selectează...';

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <div 
                className={`${styles.dropdownHeader} ${isOpen ? styles.dropdownHeaderActive : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedLabel}
                <ChevronDown size={20} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </div>
            {isOpen && (
                <div className={styles.dropdownList}>
                    {options.map(opt => (
                        <div 
                            key={opt.id} 
                            className={styles.dropdownItem} 
                            onClick={() => { onChange(opt.id); setIsOpen(false); }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Settings() {
    const navigate = useNavigate();

    const [isDomainsOpen, setIsDomainsOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passMsg, setPassMsg] = useState({ type: '', text: '' });

    const [primaryDomain, setPrimaryDomain] = useState('');
    const [secondaryDomains, setSecondaryDomains] = useState<string[]>([]);
    const [domainMsg, setDomainMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        let isMounted = true;

        async function loadUserPreferences(){
            try{
                const token = sessionStorage.getItem('token');
                const response = await fetch ("/api/user/preferences", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (isMounted){
                        setPrimaryDomain(data.primary_domain || DOMAINS[0].id);
                        setSecondaryDomains(data.secondary_domains || []);

                        if(data.primary_domain) sessionStorage.setItem('domain', data.primary_domain);
                        if(data.secondary_domains) sessionStorage.setItem('secondaryDomains', JSON.stringify(data.secondary_domains));                         
                        }
                    }
                } catch (error) {
                    console.error("Eroare la încărcarea preferințelor utilizatorului:", error);
            }
        }
        loadUserPreferences();
        return () => { isMounted = false; };
    }, []);

    const handleSecondaryToggle = (id: string) => {
        setSecondaryDomains(prev => 
            prev.includes(id) 
                ? prev.filter(d => d !== id) 
                : [...prev, id]
        );
    };

    const handleUpdateDomains = async (e: React.FormEvent) => {
        e.preventDefault();
        setDomainMsg({ type: '', text: '' });
        
        try{
            const token = sessionStorage.getItem('token');
            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    primary_domain: primaryDomain,
                    secondary_domains: secondaryDomains
                })
            });

            const data = await response.json();
            if (response.ok) {
                sessionStorage.setItem('domain', primaryDomain);
                sessionStorage.setItem('secondaryDomains', JSON.stringify(secondaryDomains));
                setDomainMsg({ type: 'success', text: data.message || 'Preferințe actualizate cu succes!' });
            } else {
                setDomainMsg({ type: 'error', text: data.error || 'A apărut o eroare la actualizarea preferințelor.' });
            }
        } catch (error) {
            setDomainMsg({ type: 'error', text: 'Eroare de rețea. Te rugăm să încerci din nou.' });
        }

        setTimeout(() => setDomainMsg({ type: '', text: '' }), 3000);
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassMsg({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setPassMsg({ type: 'error', text: 'Parolele noi nu coincid!' });
            return;
        }
        
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasNumber = /\d/.test(newPassword);

        if (newPassword.length < 8 || !hasUpperCase || !hasNumber) {
            setPassMsg({ 
                type: 'error', 
                text: 'Parola nouă trebuie să aibă minim 8 caractere, o literă mare și un număr!' 
            });
            return;
        }
        
        if (currentPassword === newPassword) {
            setPassMsg({ type: 'error', text: 'Noua parolă trebuie să fie diferită de cea curentă!' });
            return;
        }

        try{
            const token = sessionStorage.getItem('token');
            const response = await fetch('/api/user/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setPassMsg({ type: 'success', text: data.message || 'Parolă schimbată cu succes!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPassMsg({ type: 'error', text: data.error || 'A apărut o eroare la schimbarea parolei.' });
            } 
        } catch (error){
            setPassMsg({ type: 'error', text: 'Eroare de rețea. Te rugăm să încerci din nou.' });
        }

        setTimeout(() => setPassMsg({type: '', text: ''}), 4000);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('domain');
        sessionStorage.removeItem('secondaryDomains');
        sessionStorage.removeItem('isAllDomains');
        
        navigate('/login');
    };

    const accountType = sessionStorage.getItem('accountType') || 'fizic';
    const availableSecondaryDomains = DOMAINS.filter(d => d.id !== primaryDomain);
    const isAllSelected = secondaryDomains.length === availableSecondaryDomains.length;

    const handleSelectAllToggle = () => {
        if (isAllSelected) {
            setSecondaryDomains([]);
        } else {
            setSecondaryDomains(availableSecondaryDomains.map(d => d.id));
        }
    };

    return (
        <PageTransition>
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Setări Cont</h1>
                <p className={styles.subtitle}>Gestionează domeniile de monitorizare și securitatea contului tău.</p>
            </header>

            <div className={styles.contentGrid}>
                
                <div className={styles.card}>
                    <div 
                        className={styles.cardHeader} 
                        onClick={() => setIsDomainsOpen(!isDomainsOpen)}
                    >
                        <div className={styles.headerLeft}>
                            <Briefcase size={24} color="#8b5cf6" />
                            <h2 className={styles.cardTitle}>Schimbare Preferinte</h2>
                        </div>
                        <ChevronDown 
                            size={24} 
                            className={`${styles.chevron} ${isDomainsOpen ? styles.chevronOpen : ''}`} 
                        />
                    </div>
                    
                    <div className={`${styles.expandableContent} ${isDomainsOpen ? styles.open : ''}`}>
                        <div className={styles.expandableInner}>
                            <form onSubmit={handleUpdateDomains}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Domeniul Principal</label>
                                   <CustomDropdown options={DOMAINS} value={primaryDomain} onChange={setPrimaryDomain} />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Domenii Secundare Urmărite</label>
                                    <div className={styles.domainsGrid}>
                                        {accountType === 'fizic' && (<label className={`${styles.domainCheckbox} ${isAllSelected ? styles.domainCheckboxActive : ''}`}>
                                            <input type="checkbox" checked={isAllSelected}onChange={handleSelectAllToggle}/>Toate domeniile
                                    </label>
                                )}

                                    {availableSecondaryDomains.map(d => {
                                        const isChecked = secondaryDomains.includes(d.id);
                                        return (
                                            <label 
                                                key={`sec-${d.id}`} 
                                                className={`${styles.domainCheckbox} ${isChecked ? styles.domainCheckboxActive : ''}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isChecked}
                                                    onChange={() => handleSecondaryToggle(d.id)}/>
                                                {d.label}
                                            </label>
                                        );
                                    })}
                                    </div>
                                </div>

                                <button type="submit" className={styles.saveButton}>Salvează Preferințele</button>
                                {domainMsg.text && <div className={`${styles.message} ${styles[domainMsg.type]}`}>{domainMsg.text}</div>}
                            </form>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div 
                        className={styles.cardHeader} 
                        onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                    >
                        <div className={styles.headerLeft}>
                            <Shield size={24} color="#8b5cf6" />
                            <h2 className={styles.cardTitle}>Schimbare Parolă</h2>
                        </div>
                        <ChevronDown 
                            size={24} 
                            className={`${styles.chevron} ${isPasswordOpen ? styles.chevronOpen : ''}`} 
                        />
                    </div>
                    
                    <div className={`${styles.expandableContent} ${isPasswordOpen ? styles.open : ''}`}>
                        <div className={styles.expandableInner}>
                            <form onSubmit={handleUpdatePassword}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Parola Curentă</label>
                                    <input 
                                        type="password" 
                                        className={styles.input} 
                                        placeholder="Introdu parola actuală"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Noua Parolă</label>
                                    <input 
                                        type="password" 
                                        className={styles.input} 
                                        placeholder="Minim 8 caractere (1 literă mare, 1 număr)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Confirmă Noua Parolă</label>
                                    <input 
                                        type="password" 
                                        className={styles.input} 
                                        placeholder="Repetă parola nouă"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className={styles.saveButton}>Schimbă Parola</button>
                                {passMsg.text && <div className={`${styles.message} ${styles[passMsg.type]}`}>{passMsg.text}</div>}
                            </form>
                        </div>
                    </div>
                </div>

                <div className={styles.card} style={{ borderColor: '#fee2e2', background: 'var(--danger-bg, #fefafa)' }}>
                    <div className={styles.cardHeader} style={{ cursor: 'default' }}>
                        <div className={styles.headerLeft}>
                            <SettingsIcon size={24} color="#ef4444" />
                            <h2 className={styles.cardTitle} style={{ color: '#991b1b' }}>Acțiuni Cont</h2>
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', borderTop: '1px solid #fee2e2', paddingTop: '16px' }}>
                        <p style={{ color: '#7f1d1d', marginBottom: '20px', fontSize: '15px' }}>
                            Dacă te deconectezi, vei avea nevoie de adresă de email și parolă pentru a accesa din nou platforma.
                        </p>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            <LogOut size={20} />
                            Deconectează-te
                        </button>
                    </div>
                </div>

            </div>
        </div>
        </PageTransition>
    );
}