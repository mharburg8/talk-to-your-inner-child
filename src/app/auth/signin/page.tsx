import { AuthForm } from '@/components/ui/AuthForm';

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
            <AuthForm mode="signin" />
        </div>
    );
}
