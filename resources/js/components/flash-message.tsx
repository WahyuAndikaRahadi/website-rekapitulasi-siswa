import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function FlashMessage() {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            toast.success(flash.success, {
                duration: 4500,
            });
        }

        if (flash.error) {
            toast.error(flash.error, {
                duration: 7000,
                dismissible: true,
            });
        }
    }, [flash]);

    return null;
}
