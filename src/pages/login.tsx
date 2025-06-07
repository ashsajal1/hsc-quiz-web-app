import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Mail, Lock, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type Inputs = z.infer<typeof schema>;

export default function Login() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<Inputs>({
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Login data:', data);
            
            // On successful login, redirect to dashboard
            toast({
                title: "Welcome back! 👋",
                description: "You have successfully logged in.",
            });
            
            // Redirect to dashboard after successful login
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (error) {
            toast({
                title: "Login failed",
                description: "Invalid email or password. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                        <p className="text-primary-foreground/80 mt-1">Sign in to continue your learning journey</p>
                    </div>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    className={cn("pl-10", errors.email && "border-red-500")}
                                    placeholder="Email address"
                                    type="email"
                                    autoComplete="username"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    className={cn("pl-10", errors.password && "border-red-500")}
                                    placeholder="Password"
                                    type="password"
                                    autoComplete="current-password"
                                    {...register('password')}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            )}
                            <div className="text-right mt-1">
                                <Link 
                                    to="/forgot-password" 
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                                    Don't have an account?
                                </span>
                            </div>
                        </div>

                        <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full h-12 text-lg font-medium"
                            onClick={() => navigate('/signup')}
                        >
                            Create an account
                        </Button>
                    </form>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>By continuing, you agree to our{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </Link>
                    </p>
                    <div className="mt-4 flex items-center justify-center space-x-4">
                        <button className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.884-1.672-4.41-2.707-6.735-2.707-5.519 0-10 4.481-10 10s4.481 10 10 10c8.396 0 10-7.496 10-10 0-0.67-0.083-1.313-0.188-2h-9.812z" />
                            </svg>
                        </button>
                        <button className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.108 0-.612.492-1.108 1.1-1.108s1.1.496 1.1 1.108c0 .613-.492 1.108-1.1 1.108zm8 6.891h-1.706v-3.556c0-.906-.241-1.444-1.199-1.444-.777 0-1.42.5-1.56 1.2-.026.104-.039.208-.039.313v3.487h-1.703v-7.5h1.703v1.1c.4-.6 1.092-1.05 1.9-1.05 1.4 0 2.458.9 2.458 2.8v4.65z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
