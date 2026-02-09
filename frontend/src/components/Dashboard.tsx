import {useEffect, useMemo, useState} from 'react'
import { fetchDashboard } from '../api/dashboard'
import LineChartCard from './LineChartCard'
 
type Domain = "food" | "tech"

const DOMAINS: Array<{id: Domain; label: string}> = [
    {id: "food", label: "Alimentar"},
    {id: "tech", label: "Tehnologic"}
]

type ChartPoint = { date: string; value: number}
type ChartData= {title?: string; points?: ChartPoint[]}
type DashboardData = { domain: string; label: string; charts?: { inflation?: ChartData; consumption?: ChartData}}

export default function Dashboard() {
    const [domain, setDomain] = useState<Domain>("food")
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
        <div style= {{maxWidth: 1100, margin: "0 auto", padding: 24}}>
            <div style ={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                gap: 12
            }}>
                <div>
                    <div style={{fontSize: 24, fontWeight: "bold"}}>Dashboard</div>
                    <div style={{color: "#6b7280", marginTop: 4}}>Domeniu: <b>{title}</b></div>
                </div>

            <select value={domain} onChange= {(e) => setDomain(e.target.value as Domain)} style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "white",
                fontSize: 14,
                minWidth: 180
            }}> {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
            ))}              
            </select>
            </div>
        
        {loading && <div style= {{padding: 12}}>Loading...</div>}
        {err && ( <div style={{padding: 12, borderRadius: 12, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", marginBottom: 16}}>{err}</div>)}

        {!loading && !err && (
            <div style ={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
                <LineChartCard title= {inflation?.title || "Inflation"} points ={inflation?.points || []}>
                </LineChartCard>
                <LineChartCard title= {consumption?.title || "Consumption"} points ={consumption?.points || []}>
                </LineChartCard>
            </div>
        )}
        </div>
    )
}