import {Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart} from 'recharts'

export type ChartPoint = { date: string; value: number}
type Props = {title: string; points: ChartPoint[]}

function formatMonth(iso: string): string{
    const d= new Date(iso)
    const y= d.getFullYear()
    const m = String(d.getMonth()+1).padStart(2,'0')
    return `${y}-${m}`
}

export default function LineChartCard({title, points}: Props) { 
    const data = (points || []).map((p) => ({
        date: p.date,
        month: formatMonth(p.date),
        value: Number(p.value)
    }))

    return(
        <div style={{
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 16,
            background: "white",
            boxShadow: "0 1px 2px rgba(0,0,0,0.4)"
        }}>

        <div style={{fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "white"}}>{title}</div>
        
        <div style={{ color: "#9ca3af",marginBottom: 8 }}> points: {Array.isArray(points) ? points.length : "not array"} </div>
                <LineChart width={520} height={280} data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" minTickGap={28} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" dot={false} />
                    <Legend />
                </LineChart>
        </div>
    )
}