'use client';

import React from 'react';
import { Download, Share2, Award, CheckCircle } from 'lucide-react';

interface CertificatePreviewProps {
  certificate: {
    id: string;
    certificateNumber: string;
    recipientName: string;
    certificateTitle: string;
    issueDate: string;
    pdfUrl: string;
    verificationUrl?: string;
    linkedinShareUrl?: string;
  };
}

export function CertificatePreview({ certificate }: CertificatePreviewProps) {
  const handleDownload = () => {
    window.open(certificate.pdfUrl, '_blank');
  };

  const handleLinkedInShare = () => {
    if (certificate.linkedinShareUrl) {
      window.open(certificate.linkedinShareUrl, '_blank');
    }
  };

  const handleCopyVerification = () => {
    if (certificate.verificationUrl) {
      navigator.clipboard.writeText(certificate.verificationUrl);
      // You would show a toast notification here
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Certificate Preview */}
      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-8 border-8 border-double border-gray-300">
        <div className="text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CERTIFICATE OF COMPLETION
          </h1>
          <p className="text-gray-600 mb-6">This is to certify that</p>

          <h2 className="text-3xl font-bold text-blue-600 mb-6">
            {certificate.recipientName}
          </h2>

          <p className="text-gray-700 mb-4">has successfully completed</p>

          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            {certificate.certificateTitle}
          </h3>

          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Issued on {new Date(certificate.issueDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>

          <p className="text-sm text-gray-500">
            Certificate No: {certificate.certificateNumber}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-gray-50 space-y-3">
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>

        <button
          onClick={handleLinkedInShare}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#0077B5] text-white rounded-lg hover:bg-[#006399] transition-colors font-semibold"
        >
          <Share2 className="w-5 h-5" />
          Share on LinkedIn
        </button>

        {certificate.verificationUrl && (
          <button
            onClick={handleCopyVerification}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            <CheckCircle className="w-5 h-5" />
            Copy Verification Link
          </button>
        )}
      </div>
    </div>
  );
}
