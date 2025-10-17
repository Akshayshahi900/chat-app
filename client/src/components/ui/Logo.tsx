import { Zap } from 'lucide-react'
import React from 'react'

interface LogoProps {
    isCollapsed: boolean
}


const Logo: React.FC<LogoProps> = ({ isCollapsed }) => {
    return (
        <div>
            {isCollapsed ? <Zap className="w-6 h-6 text-orange-400" /> : 
            <div className='flex justify-center gap-2 '><h1 className="text-2xl font-bold text-blue-200 flex my-auto gap-2 align-middle justify-center">Zing </h1>
            <Zap className="w-6 h-6 text-orange-400" /> </div>}

        </div>)
}

export default Logo