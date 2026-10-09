import React from 'react';

function cleanDomProps(props: Record<string, any>) {
  const {
    testID,
    activeOpacity,
    numberOfLines,
    showsVerticalScrollIndicator,
    showsHorizontalScrollIndicator,
    resizeMode,
    ...rest
  } = props;
  if (testID) {
    (rest as any)['data-testid'] = testID;
  }
  return rest;
}

export const View = React.forwardRef<HTMLDivElement, any>(
  ({ className = '', style, children, ...props }, ref) => (
    <div ref={ref} className={className} style={style} {...cleanDomProps(props)}>
      {children}
    </div>
  )
);
View.displayName = 'View';

export const Text = React.forwardRef<HTMLSpanElement, any>(
  ({ className = '', style, children, numberOfLines, ...props }, ref) => {
    let lineClampClass = '';
    if (numberOfLines === 1) lineClampClass = 'truncate inline-block max-w-full';
    else if (numberOfLines && numberOfLines > 1) lineClampClass = `line-clamp-${numberOfLines}`;

    return (
      <span ref={ref} className={`${className} ${lineClampClass}`} style={style} {...cleanDomProps(props)}>
        {children}
      </span>
    );
  }
);
Text.displayName = 'Text';

export const TextInput = React.forwardRef<HTMLInputElement, any>(
  (
    {
      className = '',
      style,
      value,
      onChangeText,
      placeholder,
      placeholderTextColor,
      secureTextEntry,
      keyboardType,
      autoCapitalize,
      ...props
    },
    ref
  ) => (
    <input
      ref={ref}
      type={secureTextEntry ? 'password' : 'text'}
      value={value}
      onChange={(e) => onChangeText && onChangeText(e.target.value)}
      placeholder={placeholder}
      className={`outline-none bg-transparent ${className}`}
      style={style}
      {...cleanDomProps(props)}
    />
  )
);
TextInput.displayName = 'TextInput';

export const TouchableOpacity = React.forwardRef<HTMLDivElement, any>(
  ({ className = '', style, onPress, disabled, children, activeOpacity, ...props }, ref) => (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => {
        if (!disabled && onPress) onPress(e);
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && onPress) {
          e.preventDefault();
          onPress(e);
        }
      }}
      className={`cursor-pointer active:opacity-75 transition-opacity select-none text-left ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      style={style}
      {...cleanDomProps(props)}
    >
      {children}
    </div>
  )
);
TouchableOpacity.displayName = 'TouchableOpacity';

export const Pressable = React.forwardRef<HTMLDivElement, any>(
  ({ className = '', style, onPress, disabled, children, ...props }, ref) => (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => {
        if (!disabled && onPress) onPress(e);
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && onPress) {
          e.preventDefault();
          onPress(e);
        }
      }}
      className={`cursor-pointer active:scale-[0.98] transition-transform select-none text-left ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      style={style}
      {...cleanDomProps(props)}
    >
      {children}
    </div>
  )
);
Pressable.displayName = 'Pressable';

export const Image = React.forwardRef<HTMLImageElement, any>(
  ({ className = '', style, source, resizeMode = 'cover', alt = '', ...props }, ref) => {
    const src = typeof source === 'object' && source?.uri ? source.uri : source;
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={`object-${resizeMode} ${className}`}
        style={style}
        {...cleanDomProps(props)}
      />
    );
  }
);
Image.displayName = 'Image';

export const ScrollView = React.forwardRef<HTMLDivElement, any>(
  ({ className = '', style, horizontal, children, showsVerticalScrollIndicator, showsHorizontalScrollIndicator, ...props }, ref) => (
    <div
      ref={ref}
      className={`${horizontal ? 'overflow-x-auto flex-row' : 'overflow-y-auto flex-col'} ${className}`}
      style={style}
      {...cleanDomProps(props)}
    >
      {children}
    </div>
  )
);
ScrollView.displayName = 'ScrollView';

export const SafeAreaView = React.forwardRef<HTMLDivElement, any>(
  ({ className = '', style, children, ...props }, ref) => (
    <div ref={ref} className={`flex-1 ${className}`} style={style} {...cleanDomProps(props)}>
      {children}
    </div>
  )
);
SafeAreaView.displayName = 'SafeAreaView';

export const ActivityIndicator: React.FC<any> = ({ size = 20, color = '#059669', className = '' }) => {
  const dimension = size === 'large' ? 32 : typeof size === 'number' ? size : 20;
  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export const StatusBar: React.FC<any> = () => null;

export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => styles,
  flatten: (style: any) => style,
};

export const Platform = {
  OS: 'ios',
  select: (obj: any) => obj.ios || obj.default,
};

export const Dimensions = {
  get: () => ({ width: 390, height: 844 }),
};
