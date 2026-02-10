import {Line, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, ResponsiveContainer} from 'recharts'
import Card from './Card'

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

    const empty= !Array.isArray(points) || points.length === 0

    return(
       <Card title={title}>
        {empty ? (
            <div className= 'rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300'>
                No data available
            </div>
        ) : (
            <div className='h-72 w-full'>
                <ResponsiveContainer width= '100%' height= '100%'>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" minTickGap={28} />
                        <YAxis />
                        <Tooltip />
                        <Line type='monotone' dataKey='value' dot={false}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )}
       </Card>
    )
}