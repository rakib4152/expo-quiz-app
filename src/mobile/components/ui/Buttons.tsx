import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Loader2 } from 'lucide-react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  isLoading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
}) => {
  const baseStyles = 'flex-row items-center justify-center rounded-2xl';

  const sizeStyles = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-3',
    lg: 'px-5 py-4',
  }[size];

  const variantStyles = {
    primary: 'bg-emerald-600 active:bg-emerald-700 shadow-sm',
    secondary: 'bg-slate-800 active:bg-slate-700',
    outline: 'border border-slate-300 dark:border-slate-700 bg-transparent',
    danger: 'bg-rose-600 active:bg-rose-700',
    ghost: 'bg-transparent',
  }[variant];

  const textVariantStyles = {
    primary: 'text-white font-bold',
    secondary: 'text-white font-bold',
    outline: 'text-slate-800 dark:text-slate-200 font-bold',
    danger: 'text-white font-bold',
    ghost: 'text-slate-600 dark:text-slate-400 font-semibold',
  }[variant];

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${disabled || isLoading ? 'opacity-50' : ''} ${className}`}
    >
      {isLoading && <Loader2 size={16} color="#ffffff" className="mr-2" />}
      {typeof children === 'string' ? (
        <Text className={`${textSizeStyles} ${textVariantStyles}`}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};
