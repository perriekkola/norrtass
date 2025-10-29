import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';

function SuccessContent() {
  return (
    <Container className="py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600" />

        <h1 className="mt-6 text-3xl font-bold tracking-tight lg:text-4xl">
          Payment Successful!
        </h1>

        <p className="text-muted-foreground mt-4 text-lg">
          Thank you for your purchase. You will receive a confirmation email
          shortly.
        </p>

        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
