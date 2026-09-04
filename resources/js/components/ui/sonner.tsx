/**
 * Compatibility shim: file ini dulu pakai sonner, sekarang
 * re-export Toaster dari react-hot-toast supaya layout
 * yang import { Toaster } from '@/components/ui/sonner' tidak perlu diubah.
 */
export { Toaster } from 'react-hot-toast';
