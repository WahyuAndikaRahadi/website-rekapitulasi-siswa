import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, Mail, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout 
            title="Atur Ulang Kata Sandi" 
            description="Silakan buat kata sandi baru yang kuat untuk akun Anda"
        >
            <Head title="Atur Ulang Kata Sandi - SMKN 69 Jakarta" />

            <form onSubmit={submit} className="space-y-4">
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
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="pl-10 h-11 border-slate-200 bg-slate-100/70 text-slate-600 text-sm"
                            readOnly
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Kata Sandi Baru
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <Lock className="size-4" />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            className="pl-10 pr-10 h-11 border-slate-200 focus:border-[#1E5FA8] focus:ring-[#1E5FA8] bg-slate-50/50 focus:bg-white text-sm"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Minimal 8 karakter"
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Konfirmasi Kata Sandi Baru
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <Lock className="size-4" />
                        </div>
                        <Input
                            id="password_confirmation"
                            type={showPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            className="pl-10 pr-10 h-11 border-slate-200 focus:border-[#1E5FA8] focus:ring-[#1E5FA8] bg-slate-50/50 focus:bg-white text-sm"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Ketik ulang kata sandi baru"
                        />
                    </div>
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button 
                    type="submit" 
                    className="mt-2 w-full h-11 bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] hover:from-[#081B42] hover:to-[#174D88] text-white font-semibold text-sm shadow-md shadow-blue-900/20 cursor-pointer" 
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                            <span>Menyimpan Kata Sandi...</span>
                        </>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <ShieldCheck className="size-4" />
                            <span>Simpan Kata Sandi Baru</span>
                        </span>
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
