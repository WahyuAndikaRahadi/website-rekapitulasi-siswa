import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, Mail, Send } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout 
            title="Lupa Kata Sandi" 
            description="Masukkan alamat email Anda untuk menerima tautan pemulihan kata sandi"
        >
            <Head title="Lupa Kata Sandi - SMKN 69 Jakarta" />

            {status && (
                <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <div className="space-y-6">
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
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nama@smkn69jkt.sch.id"
                                className="pl-10 h-11 border-slate-200 focus:border-[#1E5FA8] focus:ring-[#1E5FA8] bg-slate-50/50 focus:bg-white text-sm"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-11 bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] hover:from-[#081B42] hover:to-[#174D88] text-white font-semibold text-sm shadow-md shadow-blue-900/20 cursor-pointer" 
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                <span>Mengirim Tautan...</span>
                            </>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Send className="size-4" />
                                <span>Kirim Tautan Pemulihan</span>
                            </span>
                        )}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <TextLink href={route('login')} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E5FA8] hover:text-[#0B2559]">
                        <ArrowLeft className="size-3.5" />
                        <span>Kembali ke halaman masuk</span>
                    </TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
