import {useState} from 'react'
import Card from './Card'
import DomainSelect, {type Domain} from './DomainSelect'

const DOMAINS: Array<{id: Domain; label: string}> = [
    {id: 'food', label: 'Alimentar'},
    {id: 'tech', label: 'Tehnologic'}
]

export default function DomainSetupModal({isOpen, onConfirm}: {
    isOpen: boolean,
    onConfirm: (domain: Domain) => void
}) {
    if (!isOpen) return null

    const [selected, setSelected] = useState<Domain>('food')

    return(
        <div className= 'fixed inset-0 z-50'>
            <div className= 'absolute inset-0 bg-black/40 backdrop-blur-sm'/>

            <div className= 'relative mx-auto flex min-h-full max-w-[520px] items-center justify-center p-4'>
                <Card className= 'w-full'>
                    <div className= 'mb-2 text-2xl font-extrabold'>Alege domeniul principal de activitate</div>
                    <div className= 'text-sm text-slate-600 dark:text-slate-300'>
                        Pentru a personaliza dashboard-ul, selecteaza un domeniu! Poate fi oricand schimbat din setarile contului.
                    </div>

                    <div className= 'mt-5'>
                        <DomainSelect value={selected} onChange={setSelected} options= {DOMAINS} />
                    </div>

                    <button onClick={() => onConfirm(selected)} className='mt-6 w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-violet-700'>Continua</button>
                </Card>
            </div>
        </div>
    )
}