import { useNavigate } from "react-router-dom"

export default function Settings() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("preffered_domain")
    navigate("/login")
  }

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Setari cont</h1>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6">

        <h2 className="text-lg font-semibold mb-4">Securitate</h2>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl transition-all"
        >
          Logout
        </button>

      </div>
    </div>
  )
}