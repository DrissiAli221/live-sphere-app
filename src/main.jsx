import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "@/ui/provider"
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Movies from './pages/movies/Movies'
import Shows from './pages/tv/Shows'
import Search from './pages/search/Search'
import DetailsPage from './pages/DetailsPage'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/movies',
                element: <Movies />,
            },
            {
                path : '/shows',
                element: <Shows />,
            },
            {
                path : '/search',
                element: <Search />,
            },
            {
                path: '/:type/:id', //dynamic path
                element: <DetailsPage />,
            }
        ]
    }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
        <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
