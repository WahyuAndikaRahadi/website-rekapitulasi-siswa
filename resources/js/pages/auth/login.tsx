import { motion } from 'motion/react';
import { ArrowRight, Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

// Fade-in + slide-up bertahap per elemen
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay },
});

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Masuk ke Akun"
            description="Gunakan email dan kata sandi yang diberikan oleh Bagian Tata Tertib."
        >
            <Head title="Masuk - SMKN 69 Jakarta" />

            {/* Status pesan (misal: setelah reset password) */}
            {status && (
                <motion.div
                    {...fadeUp(0)}
                    className="mb-5 rounded-lg border border-success/30 bg-success/8 px-4 py-3 text-sm text-success"
                >
                    {status}
                </motion.div>
            )}

            <form className="flex flex-col gap-5" onSubmit={submit}>
                {/* Email */}
                <motion.div {...fadeUp(0.05)} className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                        Alamat email
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                            <Mail className="size-4" />
                        </div>
                        <Input
                            id="email"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="username"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Masukkan email atau username"
                            className="h-11 pl-10 bg-background/60 focus-visible:bg-background"
                        />
                    </div>
                    <InputError message={errors.email} />
                </motion.div>

                {/* Password */}
                <motion.div {...fadeUp(0.1)} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium text-foreground">
                            Kata sandi
                        </Label>
                        {canResetPassword && (
                            <a
                                href={route('password.request')}
                                className="text-xs font-medium text-primary-light hover:text-primary hover:underline transition-colors"
                                tabIndex={5}
                            >
                                Lupa kata sandi?
                            </a>
                        )}
                    </div>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                            <Lock className="size-4" />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Masukkan kata sandi"
                            className="h-11 pl-10 pr-10 bg-background/60 focus-visible:bg-background"
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </motion.div>

                {/* Remember me */}
                <motion.div {...fadeUp(0.15)} className="flex items-center gap-2.5">
                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) => setData('remember', checked)}
                        tabIndex={3}
                    />
                    <Label
                        htmlFor="remember"
                        className="text-sm font-normal text-muted-foreground cursor-pointer select-none"
                    >
                        Ingat saya di perangkat ini
                    </Label>
                </motion.div>

                {/* Submit */}
                <motion.div {...fadeUp(0.2)}>
                    <Button
                        type="submit"
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-sm group"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <LoaderCircle className="size-4 animate-spin" />
                                <span>Memverifikasi...</span>
                            </>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <span>Masuk ke Akun</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </span>
                        )}
                    </Button>
                </motion.div>
            </form>
        </AuthLayout>
    );
}
