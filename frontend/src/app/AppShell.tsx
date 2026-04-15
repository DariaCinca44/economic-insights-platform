import { NavLink } from "react-router-dom";
import { BarChart3, LineChart, GitCompare, FileDown, Settings, User, Moon, Sun} from "lucide-react";
import styles from './AppShell.module.css';

export default function AppShell({children, theme, onToggleTheme} : {
    children: React.ReactNode;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}) {
    const item= (to: string, label: string, Icon: any) => (
        <NavLink to={to} end={to === '/'} className={({isActive}) => isActive? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}>
            <Icon size={18} className={styles.navIcon} />
            {label}
        </NavLink>
    )

    return (
        <div className={styles.wrapper}>
            <div className= {styles.layoutGrid}>

                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <div className={styles.logo} />
                        <div>
                            <div className={styles.sidebarTitle}>Economic Analytics</div>
                            <div className={styles.sidebarSubtitle}>v1</div>
                        </div>
                    </div>

                    <nav className={styles.navContainer}>
                        {item('/', 'Dashboard', BarChart3)}
                        {item('/forecast', 'Forecast', LineChart)}
                        {item('/compare', 'Compare', GitCompare)}
                        {item('/export', 'Export', FileDown)}
                        {item('/settings', 'Settings', Settings)}
                        {item('/explore', 'Explore', LineChart)}
                    </nav>
                </aside>

                <div>
                    <header className={styles.header}>
                        <div className={styles.headerInner}>
                            <button onClick={onToggleTheme} className={styles.headerButton}>
                                {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </button>

                            <button className={styles.headerButton}>
                                <span className={styles.userAvatar}>
                                    <User size={18} />
                                </span>
                                My profile
                            </button>
                        </div>
                    </header>

                    <main className={styles.main}>
                        <div className={styles.mainInner}>
                            {children}
                        </div>
                    </main>
                </div>

            </div>
        </div>
    )
}