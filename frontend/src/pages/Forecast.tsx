import PageTransition from "../components/PageTransition";

export default function Forecast(){
    return(
        <PageTransition>
            <div className= "text-3xl font-extrabold">Forecast</div>
            <div className="mt-2 text-slate-500 dark:text-slate-400">
                Urmeaza sa conectam datele
            </div>
        </PageTransition>
    )
}