import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfGeneratorService {
  /**
   * Generate certificate PDF
   * Phase 6: PDF certificate downloads
   */
  async generateCertificatePdf(template: any, data: any): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 50,
        });

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'uploads', 'certificates');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `cert-${Date.now()}.pdf`;
        const filepath = path.join(uploadsDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Apply design config from template
        const config = template.designConfig || {};
        const primaryColor = config.primaryColor || '#1a1a1a';
        const secondaryColor = config.secondaryColor || '#666666';
        const fontFamily = config.fontFamily || 'Helvetica';

        // Add background image if exists
        if (template.backgroundImageUrl) {
          // TODO: Download and add background image
        }

        // Add border
        doc
          .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
          .lineWidth(2)
          .stroke(primaryColor);

        // Add decorative elements
        doc
          .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
          .lineWidth(1)
          .stroke(secondaryColor);

        // Title
        doc
          .fontSize(36)
          .font('Helvetica-Bold')
          .fillColor(primaryColor)
          .text('CERTIFICATE OF COMPLETION', 0, 120, {
            align: 'center',
          });

        // Subtitle
        doc
          .fontSize(14)
          .font('Helvetica')
          .fillColor(secondaryColor)
          .text('This is to certify that', 0, 180, {
            align: 'center',
          });

        // Recipient name
        doc
          .fontSize(32)
          .font('Helvetica-Bold')
          .fillColor(primaryColor)
          .text(data.recipientName, 0, 210, {
            align: 'center',
          });

        // Description
        doc
          .fontSize(14)
          .font('Helvetica')
          .fillColor(secondaryColor)
          .text(data.description, 0, 260, {
            align: 'center',
            width: doc.page.width - 200,
          });

        // Certificate title
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .fillColor(primaryColor)
          .text(data.certificateTitle, 0, 320, {
            align: 'center',
          });

        // Issue date
        const issueDate = new Date(data.issueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor(secondaryColor)
          .text(`Issued on: ${issueDate}`, 0, 400, {
            align: 'center',
          });

        // Signature section
        const signatureY = 450;

        // Instructor signature
        if (template.signatureImageUrl) {
          // TODO: Download and add signature image
        } else {
          doc
            .moveTo(150, signatureY)
            .lineTo(300, signatureY)
            .stroke(secondaryColor);

          doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor(secondaryColor)
            .text('Instructor Signature', 150, signatureY + 10, {
              width: 150,
              align: 'center',
            });
        }

        // Organization signature
        doc
          .moveTo(doc.page.width - 300, signatureY)
          .lineTo(doc.page.width - 150, signatureY)
          .stroke(secondaryColor);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor(secondaryColor)
          .text('Platform Director', doc.page.width - 300, signatureY + 10, {
            width: 150,
            align: 'center',
          });

        // Generate QR code for verification
        const verificationUrl = `${process.env.FRONTEND_URL}/certificates/verify/${data.certificateNumber || 'pending'}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
          width: 100,
          margin: 1,
        });

        // Add QR code (bottom right)
        if (qrCodeDataUrl) {
          const qrImage = Buffer.from(
            qrCodeDataUrl.replace(/^data:image\/\w+;base64,/, ''),
            'base64',
          );
          doc.image(qrImage, doc.page.width - 130, doc.page.height - 130, {
            width: 80,
            height: 80,
          });

          doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor(secondaryColor)
            .text('Scan to verify', doc.page.width - 130, doc.page.height - 40, {
              width: 80,
              align: 'center',
            });
        }

        // Certificate number (bottom left)
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor(secondaryColor)
          .text(`Certificate No: ${data.certificateNumber || 'Pending'}`, 50, doc.page.height - 50);

        // Finalize PDF
        doc.end();

        stream.on('finish', () => {
          const pdfUrl = `${process.env.API_URL}/uploads/certificates/${filename}`;
          resolve(pdfUrl);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
