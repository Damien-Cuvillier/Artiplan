// pages/NotFound.jsx
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page introuvable</p>
        <p className="mt-2 text-gray-500">
          La page que vous cherchez n'existe pas.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Home className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

export default NotFound