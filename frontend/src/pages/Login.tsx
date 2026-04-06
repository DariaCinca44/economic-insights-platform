import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './Login.module.css'

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
       <div className={styles.wrapper}>
        <div className={styles.card}>

            <div className={styles.leftSide}>
                <div>
                    <h1 className={styles.brandTitle}>Economic Insights Platform</h1>
                    <p className={styles.brandSubtitle}>AI-powered economic analytics & forecasting platform</p>
                </div>
            </div>

            <div className={styles.rightSide}>
                <h2 className={styles.formTitle}>{isSignup? 'Creeaza cont':'Bine ai revenit!'}</h2>
                <p className={styles.formSubtitle}>{isSignup? 'Inregistreaza-te pentru a accesa platforma.':'Conecteaza-te pentru a accesa platforma.'}</p>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                className={styles.inputField} />
                <input type="password" placeholder="Parola" value={password} onChange={e => setPassword(e.target.value)} className={styles.inputField} />
                {error && 
                    <div className={styles.errorText}>{error}</div>
                }

                <button onClick={handleSubmit} className={styles.submitButton}>{isSignup? 'Inregistreaza-te':'Conecteaza-te'}</button>

                <div className={styles.toggleContainer}>
                    {isSignup? 'Ai deja un cont?':'Nu ai un cont?'}
                    <button className={styles.toggleBtn} onClick={() => setIsSignup(!isSignup)}>
                        {isSignup? 'Conecteaza-te':'Inregistreaza-te'}
                    </button>
                </div>
            </div>
        </div>
    </div>
    )
}