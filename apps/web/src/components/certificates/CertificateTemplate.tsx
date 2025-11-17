import React, { forwardRef } from 'react';
import { Award, CheckCircle2, Shield } from 'lucide-react';
import type { Certificate } from '@/types/api.types';

interface CertificateTemplateProps {
  certificate: Certificate;
  showQRCode?: boolean;
}

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ certificate, showQRCode = true }, ref) => {
    const formattedDate = new Date(certificate.completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedIssueDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div
        ref={ref}
        className="relative h-[800px] w-[1100px] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50"
        style={{
          fontFamily: 'Georgia, serif',
          boxShadow: '0 0 40px rgba(0,0,0,0.1)',
        }}
      >
        {/* Decorative Border */}
        <div className="absolute inset-4 border-8 border-double border-blue-900/20" />
        <div className="absolute inset-8 border-2 border-blue-600/30" />

        {/* Corner Decorations */}
        <div className="absolute top-12 left-12 h-24 w-24 border-t-4 border-l-4 border-blue-600/40" />
        <div className="absolute top-12 right-12 h-24 w-24 border-t-4 border-r-4 border-blue-600/40" />
        <div className="absolute bottom-12 left-12 h-24 w-24 border-b-4 border-l-4 border-blue-600/40" />
        <div className="absolute bottom-12 right-12 h-24 w-24 border-b-4 border-r-4 border-blue-600/40" />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Shield className="h-96 w-96 text-blue-900" />
        </div>

        {/* Content */}
        <div className="relative flex h-full flex-col items-center justify-center p-20">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <Award className="h-20 w-20 text-blue-600" strokeWidth={1.5} />
            </div>
            <h1
              className="mb-2 text-5xl font-bold tracking-wider text-blue-900"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Certificate of Completion
            </h1>
            <div className="mx-auto mt-2 h-1 w-32 bg-gradient-to-r from-transparent via-blue-600 to-transparent" />
          </div>

          {/* Presented To */}
          <div className="mb-8 text-center">
            <p className="mb-4 text-lg uppercase tracking-widest text-slate-600">
              This is to certify that
            </p>
            <h2
              className="mb-4 text-5xl font-bold text-slate-900"
              style={{
                fontFamily: 'Brush Script MT, cursive',
                borderBottom: '2px solid #cbd5e1',
                paddingBottom: '8px',
              }}
            >
              {certificate.recipientName}
            </h2>
            <p className="text-lg text-slate-600">
              has successfully completed the course
            </p>
          </div>

          {/* Course Title */}
          <div className="mb-8 text-center">
            <h3
              className="mb-2 text-4xl font-bold text-blue-900"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              {certificate.title}
            </h3>
            {certificate.description && (
              <p className="mx-auto max-w-2xl text-base italic text-slate-600">
                {certificate.description}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="mb-8 flex gap-12 text-center">
            {certificate.duration && (
              <div className="flex flex-col items-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">Duration</p>
                <p className="text-base font-bold text-slate-900">{certificate.duration}h</p>
              </div>
            )}

            {certificate.score !== undefined && certificate.score !== null && (
              <div className="flex flex-col items-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">Final Score</p>
                <p className="text-base font-bold text-slate-900">{certificate.score}%</p>
              </div>
            )}

            {certificate.grade && (
              <div className="flex flex-col items-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">Grade</p>
                <p className="text-base font-bold text-slate-900">{certificate.grade}</p>
              </div>
            )}

            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <CheckCircle2 className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">Completed</p>
              <p className="text-base font-bold text-slate-900">{formattedDate}</p>
            </div>
          </div>

          {/* Skills */}
          {certificate.skills && certificate.skills.length > 0 && (
            <div className="mb-8 text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-600">
                Skills Acquired
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {certificate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto grid w-full grid-cols-3 gap-8 border-t border-slate-300 pt-8">
            {/* Issuer */}
            <div className="text-center">
              <div className="mb-2 h-px w-32 bg-slate-400" />
              <p className="text-sm font-bold text-slate-900">{certificate.issuer}</p>
              <p className="text-xs text-slate-600">Issuing Organization</p>
            </div>

            {/* Verification Code */}
            <div className="flex flex-col items-center">
              {showQRCode && (
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded border-2 border-slate-300 bg-white">
                  {/* QR Code placeholder - in production, use a QR code library */}
                  <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-px bg-slate-200 p-1">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className={i % 3 === 0 ? 'bg-slate-900' : 'bg-white'} />
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs font-mono text-slate-600">ID: {certificate.verificationCode.slice(0, 12)}</p>
              <p className="text-xs text-slate-500">Verify at verify.example.com</p>
            </div>

            {/* Issue Date */}
            <div className="text-center">
              <div className="mb-2 h-px w-32 bg-slate-400" />
              <p className="text-sm font-bold text-slate-900">{formattedIssueDate}</p>
              <p className="text-xs text-slate-600">Date of Issue</p>
            </div>
          </div>

          {/* Digital Signature Indicator */}
          {certificate.digitalSignature && (
            <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1 text-xs">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Digitally Verified</span>
            </div>
          )}
        </div>

        {/* Background Pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #0ea5e9 0,
              #0ea5e9 1px,
              transparent 1px,
              transparent 20px
            )`,
          }}
        />
      </div>
    );
  },
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
