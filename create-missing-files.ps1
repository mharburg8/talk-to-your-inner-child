# Navigate to project directory
cd C:\Users\mrted\talk-to-your-inner-child

# Create directories
Write-Host "Creating directories..."
New-Item -ItemType Directory -Force -Path "src/app/auth/signin" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/auth/signup" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/dashboard" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/onboarding" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/personas/new" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/personas/[id]" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/sessions/[id]" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/api/auth/signup" | Out-Null

# Create signin page
Write-Host "Creating signin page..."
@'
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-primary-600">
            Sign up
          </Link>
        </p>
        <p className="mt-4 text-xs text-gray-500 text-center">
          Demo: demo@example.com / demo123
        </p>
      </div>
    </div>
  );
}
'@ | Out-File -FilePath "src/app/auth/signin/page.tsx" -Encoding UTF8

# Create signup page
Write-Host "Creating signup page..."
@'
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create account');
      return;
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Account created but login failed');
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
'@ | Out-File -FilePath "src/app/auth/signup/page.tsx" -Encoding UTF8

# Create signup API route
Write-Host "Creating signup API route..."
@'
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
'@ | Out-File -FilePath "src/app/api/auth/signup/route.ts" -Encoding UTF8

# Create dashboard page
Write-Host "Creating dashboard page..."
@'
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchPersonas();
    }
  }, [status]);

  const fetchPersonas = async () => {
    const res = await fetch('/api/personas');
    const data = await res.json();
    setPersonas(data.personas || []);
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <Link
            href="/personas/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            + New Persona
          </Link>
        </div>

        {personas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">You haven't created any personas yet.</p>
            <Link href="/personas/new" className="text-primary-600 hover:underline">
              Create your first persona
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona: any) => (
              <Link
                key={persona.id}
                href={`/personas/${persona.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg mb-2">{persona.label}</h3>
                <p className="text-sm text-gray-600">Age: {persona.ageNumber}</p>
                <p className="text-sm text-gray-600">Tone: {persona.tonePreset}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
'@ | Out-File -FilePath "src/app/dashboard/page.tsx" -Encoding UTF8

# Create onboarding page
Write-Host "Creating onboarding page..."
@'
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    const res = await fetch('/api/onboarding/status');
    const data = await res.json();
    if (data.hasConsent) {
      router.push('/dashboard');
    }
  };

  const handleAccept = async () => {
    await fetch('/api/onboarding/accept-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consentVersion: 'v1_audio_2026_01',
        scopes: ['audio_processing', 'voice_synthesis', 'storage_retention'],
      }),
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Before We Begin</h1>
        
        <div className="space-y-4 text-sm text-gray-700">
          <p className="font-semibold">This is NOT therapy:</p>
          <p>This application is a tool for self-reflection, not professional mental health treatment.</p>
          
          <p className="font-semibold">You are in control:</p>
          <p>You can stop, pause, or delete your data at any time.</p>
          
          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>I understand and accept these terms</span>
          </label>
        </div>

        <button
          onClick={handleAccept}
          disabled={!accepted}
          className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}
'@ | Out-File -FilePath "src/app/onboarding/page.tsx" -Encoding UTF8

# Create placeholder pages
Write-Host "Creating placeholder pages..."
@'
export default function NewPersonaPage() {
  return <div className="p-8">Create New Persona - Coming Soon</div>;
}
'@ | Out-File -FilePath "src/app/personas/new/page.tsx" -Encoding UTF8

@'
export default function PersonaDetailPage() {
  return <div className="p-8">Persona Detail - Coming Soon</div>;
}
'@ | Out-File -FilePath "src/app/personas/[id]/page.tsx" -Encoding UTF8

@'
export default function SessionPage() {
  return <div className="p-8">Session - Coming Soon</div>;
}
'@ | Out-File -FilePath "src/app/sessions/[id]/page.tsx" -Encoding UTF8

# Create seed file
Write-Host "Creating seed file..."
@'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
    },
  });

  console.log('Created user:', user.email);

  const consent = await prisma.consentRecord.create({
    data: {
      userId: user.id,
      consentVersion: 'v1_audio_2026_01',
      scopes: ['audio_processing', 'voice_synthesis', 'storage_retention'],
      ipAddress: '127.0.0.1',
    },
  });

  console.log('Created consent record:', consent.consentVersion);
  console.log('\nDemo credentials:');
  console.log('Email: demo@example.com');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
'@ | Out-File -FilePath "prisma/seed.ts" -Encoding UTF8

Write-Host ""
Write-Host "✅ All files created successfully!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. npm run prisma:seed"
Write-Host "2. npm run dev"
Write-Host "3. Visit http://localhost:3000"