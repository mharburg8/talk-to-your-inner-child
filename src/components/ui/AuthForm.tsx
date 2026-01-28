'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from './Button';
import { Input } from './Input';

interface AuthFormProps {
    mode: 'signin' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '', // Only for signup
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (mode === 'signup') {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }

                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Something went wrong');
                }

                // Auto sign in after signup
                const signInRes = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (signInRes?.error) {
                    throw new Error(signInRes.error);
                }

                router.push('/dashboard');
            } else {
                const res = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (res?.error) {
                    throw new Error('Invalid email or password');
                }

                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 rounded-2xl glass-panel">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary-900 mb-2">
                    {mode === 'signin' ? 'Welcome Back' : 'Begin Your Journey'}
                </h2>
                <p className="text-secondary-600">
                    {mode === 'signin'
                        ? 'Continue your conversation with your inner self'
                        : 'Create an account to start your reflection journey'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />

                {mode === 'signup' && (
                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                    />
                )}

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                >
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-secondary-600">
                {mode === 'signin' ? (
                    <>
                        Don't have an account?{' '}
                        <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign up
                        </Link>
                    </>
                ) : (
                    <>
                        Already have an account?{' '}
                        <Link href="/auth/signin" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign in
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
