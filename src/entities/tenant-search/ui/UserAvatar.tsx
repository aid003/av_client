import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/components/ui/avatar';

interface UserAvatarProps {
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ firstName, lastName, photoUrl, size = 'md' }: UserAvatarProps) {
  const getInitials = () => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`.trim() || '?';
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <Avatar className={sizeClasses[size]}>
      {photoUrl && <AvatarImage src={photoUrl} alt={`${firstName} ${lastName || ''}`.trim()} />}
      <AvatarFallback>{getInitials()}</AvatarFallback>
    </Avatar>
  );
}
