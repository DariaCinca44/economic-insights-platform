import { NavLink } from "react-router-dom";
import { BarChart3, LineChart, GitCompare, FileDown, Settings, User, Moon, Sun, TrendingUp} from "lucide-react";
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
            <div className = {styles.topFadeMask}></div>
            <nav className={styles.glassNavbar}>
                
                <div className={styles.logoContainer}>
                    <div className={styles.logoBox}>
                        <TrendingUp size={20} color="white" />
                    </div>
                    <div>
                        <div className={styles.logoTitle}>EcoPredict</div>
                        <div className={styles.logoSubtitle}>Analytics v2</div>
                    </div>
                </div>

                <div className={styles.navContainer}>
                    {item('/', 'Dashboard', BarChart3)}
                    {item('/explore', 'Explore', LineChart)}
                    {item('/forecast', 'Forecast', LineChart)}
                    {item('/compare', 'Compare', GitCompare)}
                    {item('/export', 'Export', FileDown)}
                    {item('/settings', 'Settings', Settings)}
                </div>

                <div className={styles.headerInner}>
                    <button onClick={onToggleTheme} className={styles.headerButton}>
                        {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
                    </button>

                    <div className={styles.headerButton}>
                        <div className={styles.avatarWrapper}> <User size={20} />
                        </div>
                    </div>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.mainInner}>
                    {children}
                </div>
            </main>
        </div>
    )
}