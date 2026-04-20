import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './Login.module.css'

export default function Login(){
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isSignup, setIsSignup] = useState(false)
    const [loading, setLoading] = useState(false)

    const [accountType, setAccountType] = useState<"fizic" | "juridic">("fizic")

    const handleSubmit= async(e: React.FormEvent) =>{
        e.preventDefault()
        setError("")
        setLoading(true)

        const endpoint= isSignup? '/api/auth/signup': '/api/auth/login'

        const payload = isSignup? {email, password, accountType} : {email, password}

        try{
            const res= await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            })

            const data= await res.json()
            if(!res.ok){
                setError(data.error || 'Eroare la autentificare!')
                setLoading(false)
                return
            }

            if(!isSignup){
                sessionStorage.clear()
                sessionStorage.setItem('token', data.token)

                if(data.user && data.user.domain){
                    sessionStorage.setItem('domain', data.user.domain)
                }

                if(data.user && data.user.accountType){
                    sessionStorage.setItem('accountType', data.user.accountType)
                }

                navigate('/')
                window.location.reload()
            } else {
                setIsSignup(false)
                setEmail("")
                setPassword("")
                setLoading(false)

                sessionStorage.setItem('accountType', accountType)
                alert('Cont creat cu succes! Acum te poti conecta.')
            }
        }catch(err){
            setError('Eroare la conectare. Incearca din nou.')
            setLoading(false)
        }
    }

    return(
      <div className={styles.pageWrapper}>
        
               <div className={styles.glassCard}>
                
                <div className={styles.logoContainer}>
                    <div className={styles.logoIcon}>📈</div>
                    <h1 className={styles.title}>Market Intelligence</h1>
                    <p className={styles.subtitle}>
                        {isSignup ? 'Creeaza un cont pentru a accesa platforma.' : 'Conecteaza-te pentru a accesa platforma.'}
                    </p>
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit}>

                    {isSignup && (
                        <div className={styles.typeToggle}>
                            <button 
                                type="button"
                                className={`${styles.typeBtn} ${accountType === 'fizic' ? styles.typeBtnActive : ''}`}
                                onClick={() => setAccountType('fizic')}
                            >
                                Persoana Fizica
                            </button>
                            <button 
                                type="button"
                                className={`${styles.typeBtn} ${accountType === 'juridic' ? styles.typeBtnActive : ''}`}
                                onClick={() => setAccountType('juridic')}
                            >
                                Persoana Juridica
                            </button>
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Adresa de E-mail</label>
                        <input 
                            type="email" 
                            className={styles.input} 
                            placeholder="nume@exemplu.ro"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Parolă</label>
                        <input 
                            type="password" 
                            className={styles.input} 
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Se proceseaza...' : (isSignup ? 'Inregistreaza-te' : 'Conecteaza-te')}
                    </button>
                </form>

                <button 
                    className={styles.switchModeBtn}
                    onClick={() => {
                        setIsSignup(!isSignup);
                        setError('');
                    }}
                >
                    {isSignup 
                        ? 'Ai deja un cont? Intra in platforma.' 
                        : 'Nu ai cont? Inregistreaza-te.'}
                </button>

            </div>
        </div>
    )
}