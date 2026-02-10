import PageTransition from "../components/PageTransition";

export default function Settings(){
    return(
        <PageTransition>
            <div className= "text-3xl font-extrabold">Settings</div>
            <div className="mt-2 text-slate-500 dark:text-slate-400">
                Urmeaza sa conectam datele
            </div>
        </PageTransition>
    )
}