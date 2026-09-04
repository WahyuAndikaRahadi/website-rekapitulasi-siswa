import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, Info, LoaderCircle, Lock, Mail, ShieldAlert } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

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
            title="Selamat Datang" 
            description="Silakan masuk untuk mengakses panel rekapitulasi data siswa"
        >
            <Head title="Masuk - SMKN 69 Jakarta" />

            {status && (
                <div className="mb-5 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm font-medium text-emerald-800">
                    <Info className="size-4 shrink-0 text-emerald-600" />
                    <span>{status}</span>
                </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Alamat Email
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <Mail className="size-4" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nama@smkn69jkt.sch.id"
                                className="pl-10 h-11 border-slate-200 focus:border-[#1E5FA8] focus:ring-[#1E5FA8] transition-all bg-slate-50/50 focus:bg-white text-sm"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Kata Sandi
                            </Label>
                            {canResetPassword && (
                                <TextLink 
                                    href={route('password.request')} 
                                    className="text-xs font-medium text-[#1E5FA8] hover:text-[#0B2559] hover:underline" 
                                    tabIndex={5}
                                >
                                    Lupa kata sandi?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
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
                                placeholder="Masukkan kata sandi..."
                                className="pl-10 pr-10 h-11 border-slate-200 focus:border-[#1E5FA8] focus:ring-[#1E5FA8] transition-all bg-slate-50/50 focus:bg-white text-sm"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                            >
                                {showPassword ? (
                                    <EyeOff className="size-4" />
                                ) : (
                                    <Eye className="size-4" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center space-x-2.5">
                            <Checkbox 
                                id="remember" 
                                name="remember" 
                                checked={data.remember} 
                                onCheckedChange={(checked) => setData('remember', checked === true)} 
                                tabIndex={3} 
                                className="border-slate-300 data-[state=checked]:bg-[#1E5FA8] data-[state=checked]:border-[#1E5FA8]"
                            />
                            <Label 
                                htmlFor="remember" 
                                className="text-xs font-medium text-slate-600 cursor-pointer select-none"
                            >
                                Ingat saya di perangkat ini
                            </Label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                        type="submit" 
                        className="mt-3 w-full h-11 bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] hover:from-[#081B42] hover:to-[#174D88] text-white font-semibold text-sm shadow-md shadow-blue-900/20 transition-all cursor-pointer group" 
                        tabIndex={4} 
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                <span>Memverifikasi...</span>
                            </>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <span>Masuk ke Akun</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </span>
                        )}
                    </Button>
                </div>

                {/* Role Guidance Box */}
                <div className="mt-2 rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[#0B2559]">
                        <Info className="size-3.5 text-[#1E5FA8]" />
                        <span>Akses Akun Terdaftar</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Akun Guru dan Administrator dikelola langsung oleh Bagian Tata Tertib & IT SMKN 69 Jakarta.
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
