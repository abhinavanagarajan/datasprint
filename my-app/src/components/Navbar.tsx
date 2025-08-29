// components/Navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const Navbar = () => {
  const pathname = usePathname()
  
  const isPatientRoute = pathname?.startsWith('/patient')
  const isTherapistRoute = pathname?.startsWith('/therapist')
  
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-blue-600">
        RehabGamify
      </Link>
      
      <div className="flex space-x-6">
        {isPatientRoute ? (
          <>
            <NavLink href="/patient/dashboard" pathname={pathname}>
              Dashboard
            </NavLink>
            <NavLink href="/patient/exercises" pathname={pathname}>
              Exercises
            </NavLink>
            <NavLink href="/patient/progress" pathname={pathname}>
              Progress
            </NavLink>
          </>
        ) : isTherapistRoute ? (
          <>
            <NavLink href="/therapist/dashboard" pathname={pathname}>
              Dashboard
            </NavLink>
            <NavLink href="/therapist/assign" pathname={pathname}>
              Assign Exercises
            </NavLink>
          </>
        ) : (
          <div className="flex space-x-4">
            <Link href="/patient/dashboard" className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
              Patient Login
            </Link>
            <Link href="/therapist/dashboard" className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              Therapist Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

const NavLink = ({ href, pathname, children }: { href: string; pathname: string | null; children: React.ReactNode }) => {
  const isActive = pathname === href
  
  return (
    <Link href={href} className={`relative px-3 py-2 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}>
      {children}
      {isActive && (
        <motion.div 
          layoutId="navbar-indicator"
          className="absolute left-0 right-0 bottom-0 h-1 bg-blue-600 rounded-t-full"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  )
}

export default Navbar