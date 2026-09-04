import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from '@/lib/toast';

export function FlashMessage() {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            toast.success(flash.success);
        }

        if (flash.error) {
            toast.error(flash.error);
        }

        if (flash.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return null;
}
