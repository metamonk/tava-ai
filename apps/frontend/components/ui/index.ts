/**
 * Tava AI - UI Components
 *
 * Core UI primitives following the Tava design system.
 * These components are the building blocks for all interfaces.
 */

// Button components
export {
  Button,
  IconButton,
  ButtonGroup,
  buttonVariants,
  type ButtonProps,
  type IconButtonProps,
  type ButtonGroupProps,
} from './button';

// Card components
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  CardBadge,
  cardVariants,
  type CardProps,
  type CardImageProps,
} from './card';

// Input components
export {
  Input,
  Textarea,
  InputGroup,
  SearchInput,
  inputVariants,
  type InputProps,
  type TextareaProps,
  type InputGroupProps,
} from './input';

// Badge components
export {
  Badge,
  StatusBadge,
  BadgeGroup,
  badgeVariants,
  type BadgeProps,
  type StatusBadgeProps,
  type StatusType,
} from './badge';

// Avatar components
export {
  Avatar,
  AvatarGroup,
  AvatarWithName,
  avatarVariants,
  type AvatarProps,
  type AvatarGroupProps,
  type AvatarWithNameProps,
} from './avatar';

// Section & Layout components
export {
  Section,
  Container,
  SectionHeader,
  Grid,
  Stack,
  Divider,
  sectionVariants,
  type SectionProps,
  type ContainerProps,
  type SectionHeaderProps,
  type GridProps,
  type StackProps,
  type DividerProps,
} from './section';

// Re-export existing components for backwards compatibility
export { default as ErrorBanner, InlineError, FormErrorSummary } from './ErrorBanner';
export {
  default as EmptyState,
  NoClientsEmpty,
  NoSessionsEmpty,
  NoPlansEmpty,
  NoPlanHistoryEmpty,
  SearchResultsEmpty,
} from './EmptyState';
export {
  LoadingSpinner,
  LoadingOverlay,
  SkeletonPlanCard,
  SkeletonSessionRow,
  SkeletonClientCard,
  LoadingButton,
} from './LoadingStates';
