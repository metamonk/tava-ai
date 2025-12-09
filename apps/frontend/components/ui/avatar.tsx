'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Avatar Variants
 *
 * Avatar styles for user representation in the Tava design system.
 */
const avatarVariants = cva(
  // Base styles
  [
    'relative inline-flex items-center justify-center',
    'shrink-0 overflow-hidden',
    'bg-gradient-to-br from-[#c4907a] to-[#a8b5a0]',
    'text-white font-semibold',
  ],
  {
    variants: {
      size: {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
        '2xl': 'w-20 h-20 text-xl',
        '3xl': 'w-24 h-24 text-2xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Fallback initials or text to show when no image */
  fallback?: string;
  /** Full name to generate initials from */
  name?: string;
  /** Show online/offline status indicator */
  status?: 'online' | 'offline' | 'away' | 'busy';
}

/**
 * Generate initials from a name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Avatar Component
 *
 * Displays a user's profile image or initials as a fallback.
 *
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="Jane Doe" />
 * <Avatar name="Jane Doe" status="online" />
 * <Avatar fallback="JD" size="lg" />
 * ```
 */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, shape, src, alt = '', fallback, name, status, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    // Determine what to show as fallback
    const displayFallback = fallback || (name ? getInitials(name) : '?');

    // Status indicator colors
    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-amber-500',
      busy: 'bg-red-500',
    };

    // Status indicator sizes
    const statusSizes = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-3.5 h-3.5',
      '2xl': 'w-4 h-4',
      '3xl': 'w-5 h-5',
    };

    return (
      <div ref={ref} className={cn(avatarVariants({ size, shape, className }))} {...props}>
        {/* Image */}
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback
          <span className="select-none">{displayFallback}</span>
        )}

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0',
              'rounded-full ring-2 ring-white dark:ring-[#161a1d]',
              statusColors[status],
              statusSizes[size || 'md']
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

/**
 * AvatarGroup Component
 *
 * Display multiple avatars in a stacked layout.
 */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum number of avatars to show */
  max?: number;
  /** Size of avatars in the group */
  size?: VariantProps<typeof avatarVariants>['size'];
  /** Children should be Avatar components */
  children: React.ReactNode;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 4, size = 'md', children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const visibleChildren = max ? childArray.slice(0, max) : childArray;
    const remainingCount = childArray.length - visibleChildren.length;

    return (
      <div ref={ref} className={cn('flex -space-x-3', className)} {...props}>
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className="ring-2 ring-white dark:ring-[#161a1d] rounded-full"
            style={{ zIndex: visibleChildren.length - index }}
          >
            {React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size })
              : child}
          </div>
        ))}

        {/* Overflow indicator */}
        {remainingCount > 0 && (
          <div
            className={cn(
              avatarVariants({ size, shape: 'circle' }),
              'ring-2 ring-white dark:ring-[#161a1d]',
              'bg-[#e8e6e1] dark:bg-[#2a2f35]',
              'text-[#3d4449] dark:text-[#9ca3af]'
            )}
            style={{ zIndex: 0 }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = 'AvatarGroup';

/**
 * AvatarWithName Component
 *
 * Avatar paired with name and optional description.
 */
export interface AvatarWithNameProps extends AvatarProps {
  /** Name to display */
  displayName: string;
  /** Description or subtitle */
  description?: string;
  /** Layout direction */
  layout?: 'horizontal' | 'vertical';
}

const AvatarWithName = React.forwardRef<HTMLDivElement, AvatarWithNameProps>(
  ({ displayName, description, layout = 'horizontal', size = 'md', ...avatarProps }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-3',
          layout === 'vertical' ? 'flex-col items-center text-center' : 'items-center'
        )}
      >
        <Avatar size={size} name={displayName} {...avatarProps} />
        <div className={layout === 'vertical' ? '' : 'min-w-0'}>
          <p className="font-semibold text-[#1a1d21] dark:text-[#f5f3ef] truncate">{displayName}</p>
          {description && <p className="text-sm text-[#6b7280] truncate">{description}</p>}
        </div>
      </div>
    );
  }
);
AvatarWithName.displayName = 'AvatarWithName';

export { Avatar, AvatarGroup, AvatarWithName, avatarVariants };
