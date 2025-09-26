
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
    className?: string;
}

export function BackButton({ className }: BackButtonProps) {
    const router = useRouter();

    return (
        <Button variant="outline" onClick={() => router.back()} className={cn("mb-4", className)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
        </Button>
    );
}
