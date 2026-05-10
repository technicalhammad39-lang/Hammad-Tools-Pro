import { NextResponse } from 'next/server';
import { adminDb, adminFieldValue } from '@/lib/server/firebase-admin';
import { createOrderPublicId } from '@/lib/order-system';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function text(value: unknown, max = 500) {
  return (typeof value === 'string' ? value.trim() : '').slice(0, max);
}

function email(value: unknown) {
  return text(value, 320).toLowerCase();
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'agency-service';
}

function validateOrigin(request: Request) {
  const origin = (request.headers.get('origin') || '').trim();
  if (!origin || origin === 'null') return true;
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').split(',')[0]?.trim() || '';
  if (!host) return true;
  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host.toLowerCase().replace(/\.$/, '');
    const currentHost = host.toLowerCase().replace(/\.$/, '');
    return originHost === currentHost || originUrl.hostname.endsWith(`.${currentHost.split(':')[0]}`);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Request origin is not allowed.' }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const payload = {
      name: text(body.name, 120),
      email: email(body.email),
      phone: text(body.phone, 80),
      company: text(body.company, 140),
      selectedService: text(body.selectedService, 160),
      budget: text(body.budget, 120),
      message: text(body.message, 4000),
      status: 'new',
      source: 'services_page',
      pagePath: text(body.pagePath, 240) || '/services',
      createdAt: adminFieldValue.serverTimestamp(),
      updatedAt: adminFieldValue.serverTimestamp(),
    };

    if (!payload.name) {
      return NextResponse.json({ success: false, error: 'Please enter your name.' }, { status: 400 });
    }
    if (!payload.email || !EMAIL_REGEX.test(payload.email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!payload.phone) {
      return NextResponse.json({ success: false, error: 'Please enter your phone or WhatsApp number.' }, { status: 400 });
    }
    if (!payload.selectedService) {
      return NextResponse.json({ success: false, error: 'Please select a service.' }, { status: 400 });
    }
    if (!payload.message || payload.message.length < 10) {
      return NextResponse.json({ success: false, error: 'Please share a few project details.' }, { status: 400 });
    }

    const inquiryRef = adminDb.collection('project_inquiries').doc();
    const orderRef = adminDb.collection('orders').doc();
    const orderPublicId = createOrderPublicId();
    const serviceSlug = slug(payload.selectedService);
    const timestamp = adminFieldValue.serverTimestamp();

    const orderItem = {
      productId: serviceSlug,
      productTitle: payload.selectedService,
      productType: 'services',
      quantity: 1,
      selectedPlanName: 'Agency Project Inquiry',
      durationLabel: payload.budget,
      planType: 'Project Inquiry',
      unitPrice: 0,
      totalPrice: 0,
    };

    const agencyOrderPayload = {
      orderId: orderPublicId,
      order_id: orderPublicId,
      orderNumber: orderPublicId,
      orderType: 'agency_service',
      source: 'agency_services',
      sourcePage: payload.pagePath,
      projectInquiryId: inquiryRef.id,
      selectedService: payload.selectedService,
      serviceName: payload.selectedService,
      company: payload.company,
      budget: payload.budget,
      projectDetails: payload.message,
      userId: `agency-${payload.email}`,
      userName: payload.name,
      userEmail: payload.email,
      email: payload.email,
      deliveryEmail: payload.email,
      targetEmail: payload.email,
      userPhone: payload.phone,
      phone: payload.phone,
      items: [orderItem],
      itemSummary: [orderItem],
      subtotal: 0,
      totalAmount: 0,
      quantityTotal: 1,
      currency: 'PKR',
      selectedPlanName: 'Agency Project Inquiry',
      primaryItemName: payload.selectedService,
      primaryPlanName: 'Agency Project Inquiry',
      primaryDuration: payload.budget,
      primaryPlanType: 'Project Inquiry',
      primaryQuantity: 1,
      primaryUnitPrice: 0,
      status: 'pending',
      tickerState: 'new',
      latestMessagePreview: payload.message.slice(0, 180),
      latestMessageAt: timestamp,
      paymentMethodName: 'Agency inquiry',
      paymentMethodSnapshot: {
        name: 'Agency inquiry',
        paymentType: 'manual_chat',
        instructions: 'Project inquiry submitted from Digital Solutions page.',
      },
      paymentProof: {
        note: payload.message,
      },
      statusHistory: [
        {
          status: 'pending',
          message: 'Agency project inquiry submitted from Digital Solutions page.',
          actorRole: 'system',
          actorId: 'services_page',
          createdAt: timestamp,
        },
      ],
      messages: [
        {
          senderRole: 'system',
          senderId: 'services_page',
          message: `Agency inquiry for ${payload.selectedService}: ${payload.message}`,
          messageType: 'message',
          createdAt: timestamp,
        },
      ],
      createdAt: timestamp,
      created_at: timestamp,
      updatedAt: timestamp,
      updated_at: timestamp,
      statusUpdatedAt: timestamp,
      status_updated_at: timestamp,
    };

    await adminDb.runTransaction(async (transaction) => {
      transaction.set(inquiryRef, {
        ...payload,
        orderDocId: orderRef.id,
        orderId: orderPublicId,
      });
      transaction.set(orderRef, agencyOrderPayload);
    });

    return NextResponse.json(
      {
        success: true,
        inquiryId: inquiryRef.id,
        orderId: orderPublicId,
        message: 'Thanks! Your project inquiry has been received. Our team will contact you soon.',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || 'Unknown error');
    console.error('[project-inquiries] failed', { message });
    return NextResponse.json(
      { success: false, error: 'Inquiry submission failed. Please try again.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
