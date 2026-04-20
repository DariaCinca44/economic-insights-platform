import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, LineChart, GitCompare, Settings, User, Moon, Sun, TrendingUp, LogOut, Building, UserCircle } from "lucide-react";
import styles from './AppShell.module.css';

const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const email = sessionStorage.getItem('email') || 'Utilizator'; 
    const accountType = sessionStorage.getItem('accountType') || 'fizic';
    const initial = email.charAt(0).toUpperCase();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/login');
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div 
                className={styles.headerButton} 
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', background: isOpen ? 'var(--hover-bg, rgba(0,0,0,0.05))' : 'transparent' }}
            >
                <div className={styles.avatarWrapper}> 
                    <User size={20} /> 
                </div>
            </div>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    
                    <div className={styles.dropdownHeader}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: 'bold'
                        }}>
                            {initial}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span className={styles.dropdownName}>
                                {email}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                {accountType === 'fizic' ? <UserCircle size={12} color="#64748b" /> : <Building size={12} color="#64748b" />}
                                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>
                                    Cont {accountType}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '8px' }}>
                        <button 
                            onClick={() => { setIsOpen(false); navigate('/settings'); }} 
                            className={styles.dropdownItem}
                        >
                            <Settings size={16} /> Setări Cont
                        </button>
                    </div>

                    <div className={styles.dropdownFooter}>
                        <button 
                            onClick={handleLogout} 
                            className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                        >
                            <LogOut size={16} /> Deconectare
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default function AppShell({children, theme, onToggleTheme} : {
    children: React.ReactNode;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}) {
    const item = (to: string, label: string, Icon: any) => (
        <NavLink to={to} end={to === '/'} className={({isActive}) => isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}>
            <Icon size={18} className={styles.navIcon} />
            {label}
        </NavLink>
    );

    return (
        <div className={styles.wrapper}>
            <div className={styles.topFadeMask}></div>
            <nav className={styles.glassNavbar}>
                
                <div className={styles.logoContainer}>
                    <div className={styles.logoBox}>
                        <TrendingUp size={20} color="white" />
                    </div>
                    <div>
                        <div className={styles.logoTitle}>MarketLens</div>
                        <div className={styles.logoSubtitle}>Strategie Inteligentă</div>
                    </div>
                </div>

                <div className={styles.navContainer}>
                    {item('/', 'Dashboard', BarChart3)}
                    {item('/explore', 'Explorați', LineChart)}
                    {item('/forecast', 'Predicție', LineChart)}
                    {item('/compare', 'Comparare', GitCompare)}
                </div>

                <div className={styles.headerInner}>
                    <button onClick={onToggleTheme} className={styles.headerButton}>
                        {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
                    </button>

                    <ProfileDropdown />
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.mainInner}>
                    {children}
                </div>
            </main>
        </div>
    );
}