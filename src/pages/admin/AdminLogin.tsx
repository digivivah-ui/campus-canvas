 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { GraduationCap, LogIn } from 'lucide-react';
 import { useAuth } from '@/hooks/useAuth';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useToast } from '@/hooks/use-toast';
 
 export default function AdminLogin() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const { signIn } = useAuth();
   const navigate = useNavigate();
   const { toast } = useToast();
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
 
     const { error } = await signIn(email, password);
 
     if (error) {
       toast({
         title: 'Login Failed',
         description: error.message,
         variant: 'destructive',
       });
     } else {
       toast({
         title: 'Welcome back!',
         description: 'You have successfully logged in.',
       });
       navigate('/admin/dashboard');
     }
 
     setIsLoading(false);
   };
 
   return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
       <div className="w-full max-w-md">
         <div className="bg-card rounded-2xl shadow-college-xl p-8">
           <div className="text-center mb-8">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
               <GraduationCap className="w-8 h-8 text-primary-foreground" />
             </div>
             <h1 className="font-display text-2xl font-bold text-foreground">Admin Portal</h1>
             <p className="text-muted-foreground mt-2">Sign in to manage your college website</p>
           </div>
 
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 type="email"
                 placeholder="admin@apexuniversity.edu"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
               <Input
                 id="password"
                 type="password"
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
             </div>
 
             <Button
               type="submit"
               className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
               disabled={isLoading}
             >
               {isLoading ? (
                 'Signing in...'
               ) : (
                 <>
                   Sign In
                   <LogIn className="ml-2 h-5 w-5" />
                 </>
               )}
             </Button>
           </form>
 
           <p className="text-center text-sm text-muted-foreground mt-6">
             Contact IT support if you need access credentials.
           </p>
         </div>
       </div>
     </div>
   );
 }