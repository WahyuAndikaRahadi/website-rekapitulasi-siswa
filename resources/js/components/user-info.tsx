import { Avatar } from '@/components/avatar';
import { type User } from '@/types';

interface UserInfoProps {
    user: User;
    showEmail?: boolean;
    textColor?: 'white' | 'dark' | 'auto';
}

export function UserInfo({ user, showEmail = false, textColor = 'white' }: UserInfoProps) {
    const isDark = textColor === 'dark';

    return (
        <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
                name={user.name}
                imageUrl={user.avatar}
                size="sm"
                className="ring-2 ring-white/10 shrink-0"
            />
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className={`truncate font-semibold ${isDark ? 'text-foreground' : 'text-white'}`}>
                    {user.name}
                </span>
                {showEmail && (
                    <span className={`truncate text-xs ${isDark ? 'text-muted-foreground' : 'text-white/70'}`}>
                        {user.email}
                    </span>
                )}
            </div>
        </div>
    );
}
