import {useEffect, useMemo, useState} from 'react'
import { fetchDashboard } from '../api/dashboard'
import LineChartCard from '../components/LineChartCard'
import Card from '../components/Card'
import DomainSelect, {type Domain} from '../components/DomainSelect'

const DOMAINS: Array<{id: Domain; label: string}> = [
    {id: "food", label: "Alimentar"},
    {id: "tech", label: "Tehnologic"}
]

type ChartPoint = { date: string; value: number}
type ChartData= {title?: string; points?: ChartPoint[]}
type DashboardData = { domain: string; label: string; charts?: { inflation?: ChartData; consumption?: ChartData}}

export default function Dashboard() {
    const initialDomain= (localStorage.getItem("domain") as Domain) || "food"
    const [domain, setDomain] = useState<Domain>(initialDomain)
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState< boolean>(false)
    const [err, setErr]= useState<string>("")


    useEffect(() => {
        let cancelled = false

        async function run(){
            setLoading(true)
            setErr("")
            try{
                const json = (await fetchDashboard(domain)) as DashboardData
                if(!cancelled){
                    setData(json)
                }
            } catch(e: unknown){
                if(!cancelled){
                    const message = e instanceof Error ?  e.message: "Fetch error!" 
                    setErr(message)
                }
            } finally {
                if(!cancelled){
                    setLoading(false)
                }
            }
    } run()
    return() => { cancelled = true}}, [domain])

    const inflation = data?.charts?.inflation
    const consumption = data?.charts?.consumption

    const title= useMemo(() => {
        const d= DOMAINS.find((x) => x.id === domain)
        return d? d.label : domain
    }, [domain])

    return(
       <div className= 'space-y-4'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
                <div className='text-3xl font-extrabold text-slate-900 dark:text-slate-50'>
                    Dashboard
                </div>
                <div className= 'mt-1 text-sm text-slate-500 dark:text-slate-400'>
                    Domeniu: {" "}
                    <span className='font-extrabold text-slate-900 dark:text-slate-50'>
                        {title}
                    </span>
                </div>
            </div>

            <DomainSelect value={domain} onChange={setDomain} options={DOMAINS}/>
        </div>

        {loading && (
            <Card title= "Se incarca...">
                <div className='text-sm text-slate-600 dark:text-slate-300'>
                    Preluam datele pentru {title}
                </div>
                <div className= 'mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10'>
                    <div className= 'h-full w-1/2 animate-pulse bg-violet-500/60'/>
                </div>
            </Card>
        )}

        {err && (
            <div className= 'rounded-2xl border border-red-200 bg-red-50 px-4 py-3 -3 text-sm font-semibold text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'>
                {err}
            </div>
        )}

        {!loading && !err &&(
            <div className= 'grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]'>
                <div className= 'grid gap-4'>
                    <LineChartCard title= {inflation?.title || 'Inflatie'} points= {inflation?.points || []}/>
                    <LineChartCard title={consumption?.title || 'Consum'} points={consumption?.points || []}/>
                </div>
            
            <Card title= 'Explicati AI' className= 'lg:sticky lg:top-24'>
                <div className= 'text-sm leading-6 text-slate-600 dark:text-slate-300'>
                    Explicatii blah blah
                    <div className= 'mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400'>Ultima actualizare: -</div>
                </div>
            </Card>
        </div>
        )}
       </div>
    )
}