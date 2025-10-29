import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

interface FormField {
  label: string;
  input_type?: string;
  field_type?: string;
  required?: boolean;
  placeholder?: string;
}

interface FormData {
  [key: string]: string | boolean;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      formData,
      formFields,
    }: { formData: FormData; formFields: FormField[] } = body;

    // Validate required environment variables
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Resend API key not configured' },
        { status: 500 }
      );
    }

    if (!process.env.TO_EMAIL || !process.env.FROM_EMAIL) {
      return NextResponse.json(
        { error: 'Email configuration missing' },
        { status: 500 }
      );
    }

    // Build email content
    let emailContent = '<h2>New Contact Form Submission</h2><br>';

    // Add form fields to email content
    formFields.forEach((field: FormField, index: number) => {
      const fieldValue = formData[`field-${index}`];
      if (fieldValue) {
        emailContent += `<p><strong>${field.label}:</strong> ${fieldValue}</p>`;
      }
    });

    // Add disclaimer status if present
    if (formData.disclaimer !== undefined) {
      emailContent += `<p><strong>Disclaimer Accepted:</strong> ${formData.disclaimer ? 'Yes' : 'No'}</p>`;
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      replyTo: process.env.FROM_EMAIL,
      subject: process.env.EMAIL_SUBJECT || 'New Contact Form Submission',
      html: emailContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
