import { NavLink } from "react-router-dom";
import { BarChart3, LineChart, GitCompare, FileDown, Settings, User, Moon, Sun} from "lucide-react";

export default function AppShell({children, theme, onToggleTheme}: {
    children: React.ReactNode;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}) {
    const item = (to: string, label: string, Icon: any) =>(
        <NavLink to ={to} end= {to === '/'} className= {({ isActive}) =>
        [
            "flex items-centered gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
            "text-slate-200/90 hover: bg-white/5",
            isActive? "bg-brand-600/20 text-white ring-1 ring-brand-400/30" : ""].join(" ")
        }>
            <Icon size={18} className= "opacity-90"/>
            {label}
        </NavLink>
    )

    return (
        <div className= "min-h-screen bg-slate-50  dark:bg-slate-950 dark:text-slate-50">
            <div className= "grid grid-cols-[280px_1fr]">
                <aside className= "sticky top-0 h-screen border-r border-white/10 bg-slate-900 px-4 py-5 text-white">
                    <div className= "mb-6 flex items-center gap-3 px-2">
                        <div className= "h-10 w-10 rounded-xl bg-brand-600" />
                        <div>
                            <div className= "text-sm font-extrabolrd leading-tight">Economic Analytics</div>
                            <div className= "text-xs text-slate-300/80">v1</div>
                        </div>
                    </div>
                    <nav className=" grid gap-2">
                        {item('/', 'Dashboard', BarChart3)}
                        {item('/forecast', 'Prognoze', LineChart)}
                        {item('/compare', 'Comparare', GitCompare)}
                        {item('/export', 'Export PDF', FileDown)}
                        {item('/settings', 'Setari', Settings)}
                    </nav>          
                </aside>
                <div>
                    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
                        <div className="mx-auto flex max-w-[1200px] items-center justify-end gap-3">
                            <button onClick={onToggleTheme} className= "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-soft transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-50 dark:shadow-none">
                            {theme === 'dark'? <Sun size={18} /> : <Moon size= {18} />}
                            {theme === 'dark' ? 'Light': 'Dark'}
                            </button>
                        
                            <button className= "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-soft transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-50 dark:shadow-none">
                                <span className= "grid h-9 2-9 place-items-center rounded-full bg-brand-600 text-white">
                                <User size={18}/>
                                </span>
                                Contul meu
                            </button>
                        </div>
                    </header>

                    <main className= "px-6 py-6">
                        <div className= "mx-auto max-w-[1200px]">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}