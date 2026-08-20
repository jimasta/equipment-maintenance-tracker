import { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const variantClass = styles[variant];
  return (
    <button
      className={[styles.button, variantClass, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
