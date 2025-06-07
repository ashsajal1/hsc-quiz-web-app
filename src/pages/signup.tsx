import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Mail, Lock, User, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    password: z.string()
        .min(6, { message: "Password must be at least 6 characters" })
        .max(20, { message: "Password must be less than 20 characters" })
        .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
        .regex(/[0-9]/, { message: "Must contain at least one number" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type Inputs = z.infer<typeof schema>;

export default function Signup() {
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
            console.log('Signup data:', data);
            
            toast({
                title: "Account created! 🎉",
                description: "Your account has been successfully created.",
            });
            
            // Redirect to login after successful signup
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create account. Please try again.",
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
                        <h2 className="text-2xl font-bold text-white">Create an account</h2>
                        <p className="text-primary-foreground/80 mt-1">Join us to start your learning journey</p>
                    </div>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    className={cn("pl-10", errors.name && "border-red-500")}
                                    placeholder="Full Name"
                                    {...register('name')}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    className={cn("pl-10", errors.email && "border-red-500")}
                                    placeholder="Email address"
                                    type="email"
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
                                    placeholder="Create a password"
                                    type="password"
                                    {...register('password')}
                                />
                            </div>
                            {errors.password ? (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            ) : (
                                <p className="mt-1 text-xs text-gray-500">At least 6 characters, 1 uppercase, 1 number</p>
                            )}
                        </div>

                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    className={cn("pl-10", errors.confirmPassword && "border-red-500")}
                                    placeholder="Confirm password"
                                    type="password"
                                    {...register('confirmPassword')}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating account...' : 'Sign up'}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full h-12 text-lg font-medium"
                            onClick={() => navigate('/login')}
                        >
                            Log in
                        </Button>
                    </form>
                </div>
                
                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    By signing up, you agree to our{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
