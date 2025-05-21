import { AnimatePresence, motion } from 'framer-motion';
import Search from '../custom-ui/search'
import Text from '../custom-ui/text'
import { HiOutlineXMark } from "react-icons/hi2";
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from '../mode-toggle';
import { Button } from '../ui/button';
import { Home, BookOpen, Lightbulb, User, LogIn, UserPlus } from 'lucide-react';

export default function SideNav({ isOpen, handleClose }: { isOpen: boolean, handleClose: () => void }) {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/quiz', label: 'Quiz', icon: BookOpen },
        { path: '/practice', label: 'Practice', icon: Lightbulb },
        { path: '/about', label: 'About', icon: User },
    ];

    const authItems = [
        { path: '/login', label: 'Login', icon: LogIn },
        { path: '/signup', label: 'Signup', icon: UserPlus },
    ];

    return (
        <AnimatePresence mode='wait'>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 select-none md:hidden bg-black z-10"
                        onClick={handleClose}
                    />
                    <motion.nav
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{
                            type: 'spring',
                            damping: 20,
                            stiffness: 200,
                        }}
                        className='fixed inset-y-0 left-0 z-20 w-[280px] bg-background border-r dark:border-gray-800 overflow-y-auto md:hidden'
                    >
                        <div className='flex items-center justify-between h-[80px] border-b dark:border-b-gray-800 px-4'>
                            <Text className='text-xl font-bold' label='Logo' />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClose}
                                className="hover:bg-muted"
                            >
                                <HiOutlineXMark className='h-5 w-5' />
                            </Button>
                        </div>

                        <div className='p-4'>
                            <Search />
                        </div>

                        <div className='px-4 space-y-1'>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={handleClose}
                                    >
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={`w-full justify-start gap-2 ${
                                                isActive ? "bg-muted" : "hover:bg-muted"
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className='px-4 mt-4 space-y-1'>
                            {authItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={handleClose}
                                    >
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={`w-full justify-start gap-2 ${
                                                isActive ? "bg-muted" : "hover:bg-muted"
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className='absolute bottom-0 left-0 right-0 p-4 border-t dark:border-t-gray-800'>
                            <ModeToggle />
                        </div>
                    </motion.nav>
                </>
            )}
        </AnimatePresence>
    );
}
