import React, { forwardRef } from 'react';
import { XIcon } from './Icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg-light dark:focus:ring-offset-dark-bg-primary";
  const variants = {
    primary: "bg-brand-secondary text-white hover:bg-brand-secondary-light focus:ring-brand-secondary",
    secondary: "bg-brand-primary text-white hover:bg-brand-primary-light focus:ring-brand-primary",
    ghost: "bg-transparent text-brand-text-dark dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-secondary"
  };
  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// FIX: Update CardProps to extend React.HTMLAttributes<HTMLDivElement> to allow passing standard div props like onClick.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={`bg-brand-bg-white dark:bg-dark-bg-secondary p-6 rounded-xl shadow-md ${className}`} {...props}>
    {children}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, id, className, ...props }, ref) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-medium text-brand-text-dark dark:text-dark-text-primary mb-1">{label}</label>}
    <input
      ref={ref}
      id={id}
      className={`w-full bg-brand-bg-light dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-brand-text-dark dark:text-dark-text-primary placeholder-brand-text-light dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary ${className}`}
      {...props}
    />
  </div>
));

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-brand-bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl w-full max-w-md m-4 transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-bold text-brand-primary">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-brand-text-dark dark:hover:text-dark-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};