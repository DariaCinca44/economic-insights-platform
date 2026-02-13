import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isSignup, setIsSignup] = useState(false)

    const handleSubmit= async() =>{
        setError("")

        const endpoint= isSignup? '/api/auth/signup': '/api/auth/login'

        try{
            const res= await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            })

            const data= await res.json()
            if(!res.ok){
                setError(data.error || 'Eroare la autentificare!')
                return
            }

            if(!isSignup){
                localStorage.clear()
                localStorage.setItem('token', data.token)

                if(data.user && data.user.domain){
                    localStorage.setItem('domain', data.user.domain)
                }

                navigate('/')
                window.location.reload()
            } else {
                setIsSignup(false)
                setEmail("")
                setPassword("")
                alert("Cont creat cu succes! Te poti conecta acum.")
            }
        }catch(err){
            setError('Eroare la conectare. Incearca din nou.')
        }
    }

    return(
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
            <div className="w-[95vw] max-w-[1200px] h-[80vh] max-h-[700px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex">
                <div className="w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-10 flex flex-col justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-4">MarketLens</h1>
                        <p className="mt-4 text-sm opacity-80 max-w-sm mx-auto">
                            AI-powered economic analytics & forecasting platform
                        </p>
                    </div>
                </div>

            <div className="w-1/2 flex flex-col justify-center px-16">
                <h2 className="text-2xl font-semibold mb-2">
                    {isSignup? "Creaza un cont nou" : "Bine ai revenit!"}
                </h2>
                <p className="text-sm text-graay-500 mb-6">
                    {isSignup? "Inregistreaza-te pentru a accesa MarketLens" : "Conecteaza-te pentru a accesa MarketLens"}
                </p>

                <input type="email" placeholder="Email" value={email} onChange={e=> setEmail(e.target.value)} className="mb-4 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 <input type="password" placeholder="Password" value={password} onChange={e=> setPassword(e.target.value)} className="mb-4 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent focus: outline-none focus:ring-2 focus:ring-blue-500" />

                 {error && (
                    <div className="text-red-500 text-sm mb-4">
                        {error}
                    </div>
                 )}

                 <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all">
                    {isSignup? "Inregistreaza-te" : "Conecteaza-te"}
                </button>

                <div className="mt-4 text-sm text-gray-500">
                    {isSignup? "Ai deja un cont?" : "Nu ai un cont?"}
                    <button className="ml-2 text-blue-600 hover:underline" onClick={()=> setIsSignup(!isSignup)}>
                        {isSignup? "Conecteaza-te" : "Inregistreaza-te"}
                    </button>
                </div>
            </div>
        </div>
    </div>
    )
}