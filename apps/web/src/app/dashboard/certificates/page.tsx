'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Award,
  Download,
  Share2,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
} from 'lucide-react';
import { certificateApi } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import type { Certificate } from '@/types/api.types';
import CertificateTemplate from '@/components/certificates/CertificateTemplate';
import { useReactToPrint } from 'react-to-print';

export default function CertificatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchQuery, filterType]);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      // TODO: Get actual user ID from auth context
      const data = await certificateApi.getUserCertificates('user_123');
      setCertificates(data as Certificate[]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load certificates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = certificates;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((cert) => cert.certificateType === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cert) =>
          cert.title.toLowerCase().includes(query) ||
          cert.recipientName.toLowerCase().includes(query) ||
          cert.verificationCode.toLowerCase().includes(query),
      );
    }

    setFilteredCertificates(filtered);
  };

  const handlePrint = useReactToPrint({
    contentRef: certificateRef,
    documentTitle: `Certificate-${selectedCertificate?.verificationCode}`,
  });

  const handleDownload = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const handleShare = async (certificate: Certificate) => {
    const shareUrl = `${window.location.origin}/certificates/verify?code=${certificate.verificationCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${certificate.title}`,
          text: `I've earned a certificate for ${certificate.title}!`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied!',
        description: 'Certificate verification link copied to clipboard',
      });
    }
  };

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowPreview(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCertificateTypeColor = (type: string) => {
    switch (type) {
      case 'COURSE':
        return 'bg-blue-100 text-blue-800';
      case 'BOOTCAMP':
        return 'bg-purple-100 text-purple-800';
      case 'QUIZ':
        return 'bg-green-100 text-green-800';
      case 'ACHIEVEMENT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-slate-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Award className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                My Certificates
              </h1>
              <p className="text-slate-600">
                View and download your earned certificates
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Certificates
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {certificates.length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Courses</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {certificates.filter((c) => c.certificateType === 'COURSE').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Bootcamps
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {certificates.filter((c) => c.certificateType === 'BOOTCAMP').length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    This Year
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {
                      certificates.filter(
                        (c) =>
                          new Date(c.issuedAt).getFullYear() ===
                          new Date().getFullYear(),
                      ).length
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search certificates..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="COURSE">Courses</SelectItem>
                  <SelectItem value="BOOTCAMP">Bootcamps</SelectItem>
                  <SelectItem value="QUIZ">Quizzes</SelectItem>
                  <SelectItem value="ACHIEVEMENT">Achievements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Certificates Grid */}
        {filteredCertificates.length === 0 ? (
          <Card className="p-12 text-center">
            <Award className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <h3 className="mb-2 text-xl font-bold text-slate-900">
              No Certificates Found
            </h3>
            <p className="text-slate-600">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your filters'
                : 'Complete courses and bootcamps to earn certificates'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCertificates.map((certificate) => (
              <Card
                key={certificate.id}
                className="overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Certificate Preview */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Award className="h-32 w-32" />
                  </div>
                  <div className="relative">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getCertificateTypeColor(certificate.certificateType)}`}
                    >
                      {certificate.certificateType}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="mb-1 text-lg font-bold text-slate-900 line-clamp-2">
                      {certificate.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {certificate.recipientName}
                    </p>
                  </div>
                </div>

                {/* Certificate Info */}
                <div className="p-4">
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>Earned {formatDate(certificate.completedAt)}</span>
                    </div>
                    {certificate.score !== undefined && certificate.score !== null && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Score: {certificate.score}%</span>
                      </div>
                    )}
                    {certificate.grade && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Award className="h-4 w-4 text-purple-600" />
                        <span>Grade: {certificate.grade}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCertificate(certificate)}
                      className="gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(certificate)}
                      className="gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(certificate)}
                      className="gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>

                  <Button
                    variant="link"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/certificates/verify?code=${certificate.verificationCode}`,
                      )
                    }
                    className="mt-2 w-full gap-1 text-xs"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Verify Certificate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Hidden Certificate for Printing */}
        <div className="hidden">
          {selectedCertificate && (
            <div ref={certificateRef}>
              <CertificateTemplate certificate={selectedCertificate} />
            </div>
          )}
        </div>

        {/* Certificate Preview Modal */}
        {showPreview && selectedCertificate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="relative max-h-[90vh] max-w-[95vw] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 z-10 bg-white"
              >
                Close
              </Button>
              <div className="scale-90 transform">
                <CertificateTemplate certificate={selectedCertificate} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
