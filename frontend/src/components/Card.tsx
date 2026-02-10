export default function Card({title, right, children, className=""}: { 
    title?: string; 
    right?: React.ReactNode; 
    children: React.ReactNode; 
    className? : string}) {
        return (
            <div className= {["rounded-[20px] border border-slate-200 bg-white shadow-soft","dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none",
                className].join(" ")}>
                    {(title || right) && (
                        <div className= "flex items-center justify-between px-5 pt-5">
                            {title? <div className= "text-base font-extrabold text-slate-900 dark:text-slate-50">{title}</div> : <div/>}
                            {right}
                        </div>
                    )}
                    <div className= "p-5">{children}</div>
            </div>
        )
    }