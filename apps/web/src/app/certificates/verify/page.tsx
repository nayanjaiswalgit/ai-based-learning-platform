'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Calendar,
  User,
  Award,
  Loader2,
} from 'lucide-react';
import { certificateApi } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import type { Certificate } from '@/types/api.types';
import CertificateTemplate from '@/components/certificates/CertificateTemplate';

export default function VerifyCertificatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [verificationCode, setVerificationCode] = useState(
    searchParams.get('code') || '',
  );
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a verification code',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      setCertificate(null);
      setIsValid(null);

      const response = await certificateApi.verifyCertificate(verificationCode.trim());
      const data = response as any;

      if (data.isValid && data.certificate) {
        setIsValid(true);
        setCertificate(data.certificate);
        toast({
          title: 'Certificate Verified!',
          description: 'This certificate is authentic and valid.',
        });
      } else {
        setIsValid(false);
        setErrorMessage(data.error || 'Certificate not found or invalid');
        toast({
          title: 'Verification Failed',
          description: data.error || 'Certificate not found',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setIsValid(false);
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to verify certificate',
      );
      toast({
        title: 'Error',
        description: 'Failed to verify certificate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-slate-900">
            Verify Certificate
          </h1>
          <p className="text-lg text-slate-600">
            Enter a certificate verification code to check its authenticity
          </p>
        </div>

        {/* Verification Input */}
        <Card className="mb-8 p-6">
          <div className="mb-4">
            <Label htmlFor="verificationCode" className="text-base">
              Verification Code
            </Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter verification code (e.g., ABC123XYZ)"
                className="flex-1 font-mono text-lg"
              />
              <Button
                onClick={handleVerify}
                disabled={isLoading}
                size="lg"
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Verify
                  </>
                )}
              </Button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              The verification code can be found at the bottom of the certificate
            </p>
          </div>

          {/* Verification Result */}
          {isValid !== null && (
            <div className="mt-6">
              {isValid ? (
                <div className="flex items-start gap-3 rounded-lg border-2 border-green-200 bg-green-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
                  <div>
                    <h3 className="mb-1 font-bold text-green-900">
                      Certificate Verified Successfully
                    </h3>
                    <p className="text-sm text-green-700">
                      This certificate is authentic and has been issued by our platform.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                  <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
                  <div>
                    <h3 className="mb-1 font-bold text-red-900">
                      Verification Failed
                    </h3>
                    <p className="text-sm text-red-700">
                      {errorMessage || 'This certificate could not be verified.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Certificate Details */}
        {certificate && isValid && (
          <div className="space-y-6">
            {/* Certificate Info Card */}
            <Card className="p-6">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Certificate Details
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Recipient
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {certificate.recipientName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Course/Program
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {certificate.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Completion Date
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {formatDate(certificate.completedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Issue Date
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {formatDate(certificate.issuedAt)}
                    </p>
                  </div>
                </div>

                {certificate.score !== undefined && certificate.score !== null && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Final Score
                      </p>
                      <p className="text-base font-bold text-slate-900">
                        {certificate.score}%
                      </p>
                    </div>
                  </div>
                )}

                {certificate.grade && (
                  <div className="flex items-start gap-3">
                    <Award className="mt-1 h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Grade</p>
                      <p className="text-base font-bold text-slate-900">
                        {certificate.grade}
                      </p>
                    </div>
                  </div>
                )}

                {certificate.duration && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-1 h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Duration
                      </p>
                      <p className="text-base font-bold text-slate-900">
                        {certificate.duration} hours
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Shield className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Issuer
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {certificate.issuer}
                    </p>
                  </div>
                </div>
              </div>

              {certificate.skills && certificate.skills.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-medium text-slate-600">
                    Skills Acquired
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {certificate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {certificate.description && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-medium text-slate-600">
                    Description
                  </p>
                  <p className="text-sm text-slate-700">
                    {certificate.description}
                  </p>
                </div>
              )}

              {certificate.isRevoked && (
                <div className="mt-6 flex items-start gap-3 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                  <div>
                    <h3 className="mb-1 font-bold text-yellow-900">
                      Certificate Revoked
                    </h3>
                    <p className="text-sm text-yellow-700">
                      This certificate has been revoked.
                      {certificate.revokeReason && (
                        <> Reason: {certificate.revokeReason}</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {!certificate.isRevoked && certificate.digitalSignature && (
                <div className="mt-6 flex items-start gap-3 rounded-lg border-2 border-green-200 bg-green-50 p-4">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <h3 className="mb-1 font-bold text-green-900">
                      Digitally Signed
                    </h3>
                    <p className="text-sm text-green-700">
                      This certificate is protected with a digital signature to ensure
                      its authenticity.
                    </p>
                    {certificate.blockchainTxHash && (
                      <p className="mt-2 text-xs font-mono text-green-600">
                        Blockchain: {certificate.blockchainTxHash}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                {certificate.pdfUrl && (
                  <Button
                    onClick={() => window.open(certificate.pdfUrl, '_blank')}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                )}
                {certificate.course && (
                  <Button
                    onClick={() => router.push(`/courses/${certificate.course?.slug}`)}
                    variant="outline"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Course
                  </Button>
                )}
              </div>
            </Card>

            {/* Certificate Preview */}
            {!certificate.isRevoked && (
              <Card className="overflow-hidden p-6">
                <h2 className="mb-4 text-2xl font-bold text-slate-900">
                  Certificate Preview
                </h2>
                <div className="flex justify-center overflow-auto bg-slate-100 p-8">
                  <div className="scale-75 transform">
                    <CertificateTemplate certificate={certificate} />
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* How to Verify Section */}
        <Card className="mt-8 border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-blue-900">
            <AlertCircle className="h-5 w-5" />
            How to Verify a Certificate
          </h3>
          <ol className="list-inside list-decimal space-y-2 text-sm text-blue-800">
            <li>Locate the verification code at the bottom of the certificate</li>
            <li>Enter the code in the field above</li>
            <li>Click the "Verify" button</li>
            <li>Review the certificate details to confirm authenticity</li>
          </ol>
          <p className="mt-4 text-sm text-blue-700">
            If you encounter any issues or suspect fraud, please contact our support
            team immediately.
          </p>
        </Card>
      </div>
    </div>
  );
}
