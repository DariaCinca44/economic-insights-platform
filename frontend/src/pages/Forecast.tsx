import {useState, useEffect} from 'react'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'
import { CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, Line } from 'recharts'

export default function Forecast() {
    const [domain] = useState(localStorage.getItem('domain') || 'food')
    const [type, setType] = useState< 'inflation' | 'consumption' > ('inflation')
    const [months, setMonths] = useState(6)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function load(){
            setLoading(true)
            const token= localStorage.getItem('token')
            const res= await fetch(`/api/forecast?domain=${domain}&type=${type}&months=${months}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const json= await res.json()
            setData(json)
            setLoading(false)
        }
        load()
    }, [domain, type, months])

    return(
        <PageTransition>
            <div className= 'flex items-center justify-between mb-6'>
                <h1 className= 'text-3xl font-extrabold'>Prognoze AI</h1>
                <div className= 'flex rounded-xl bg-slate-100 p-1 dark:bg-white/5'>
                    <button onClick={() => setType('inflation')}
                    className= {`px-4 py-2 rounded-lg text-xs font-bold transition ${type === 'inflation' ? 'bg-white shadow-sm dark:bg-slate-800' : 'text-slate-500'}`}>Inflatie</button>
                    <button onClick={()=> setType('consumption')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition ${type === 'consumption' ? 'bg-white shadow-sm dark:bg-slate-800': 'text-slate-500'}`}>Consum</button>
                </div>
                <div className= 'flex gap-2'>
                    {[3,6,12].map(m => (
                        <button key={m} onClick= {() => setMonths(m)} 
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${months === m ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800'}`}>
                            {m} Luni
                        </button>
                    ))}
                </div>
            </div>

            <div className= 'grid grid-cols-1 gap-6'>
                <Card title= {data?.title || 'Se calculeaza...'}>
                    {loading ? (
                        <div className= 'h-80 flex items-center justify-center'> Generam predictia...</div> ) : (
                            <div className= 'h-80 w-full'>
                                <ResponsiveContainer width= '100%' height= '100%'>
                                    <ComposedChart data={data?.points}>
                                        <CartesianGrid strokeDasharray= '3 3' vertical= {false} stroke='#e2e8f0' />
                                        <XAxis dataKey= 'date' tickFormatter={(str) => str.substring(0,7)} />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type= 'monotone' dataKey= 'upper' stroke= 'none' fill= '#8b5cf6' fillOpacity= {0.1} />
                                        <Area type= 'monotone' dataKey= 'lower' stroke= 'none' fill= '#8b5cf6' fillOpacity= {0.1} />
                                        <Line type= 'monotone' dataKey= 'value' stroke= '#8b5cf6' strokeWidth ={3} dot= {false} connectNulls= {true} data= {data?.points?.filter((p:any) => !p.is_forecast)}/>
                                        <Line type='monotone' dataKey= 'value' stroke='#8b5cf6' strokeWidth= {3} strokeDasharray= '5 5' dot= {false} connectNulls= {true} data= {data?.points?.filter((p:any) => p.is_forecast || p === data.points[data.points.filter((x:any) => !x.is_forecast).length -1])}/>
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                    )}
                </Card>

                {!loading && data?.explanation && (
                    <div className='bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-violet-200 dark:shadow-none'>
                        <div className= 'flex items-center gap-3 mb-4'>
                            <span className= 'text-3xl'>🧠</span>
                            <h3 className= 'text-lg font-bold uppercase tracking-widest text-violet-100'>Explicatii AI</h3>
                        </div>
                        <p className= 'text-xl leading-relaxed font-medium opacity-95 italic'>
                            "{data.explanation}"
                        </p>
                        <div className= 'mt-6 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-violet-200/60'>
                            <span className= 'px-2 py-1 bg-white/10 rounded-md'>Model: Gemini 2.5 Flash</span>
                            <span className= 'px-2 py-1 bg-white/10 rounded-md'>Analiza: Real-Time</span>
                        </div>  
                    </div>
                )}
            </div>
        </PageTransition>
    )

}