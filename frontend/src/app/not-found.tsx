import Link from 'next/link';
import Button from '@/components/ui/Button';

/**
 * Not Found page for handling 404 errors.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Icon */}
        <div className="flex justify-center mb-6">
          <div className="text-9xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            404
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-neutral-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
          It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button variant="gradient" size="lg">
              🏠 Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              📋 Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-4 text-4xl opacity-50">
          <span>🔍</span>
          <span>📄</span>
          <span>❓</span>
        </div>
      </div>
    </div>
  );
}
