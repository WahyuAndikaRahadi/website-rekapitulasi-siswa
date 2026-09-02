import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-white/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-[#1E5FA8] text-white font-medium text-xs">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">{user.name}</span>
                {showEmail && <span className="text-white/70 truncate text-xs">{user.email}</span>}
            </div>
        </>
    );
}
