import {
  Html,
  Head,
  Body,
  Container,
  Preview,
  Section,
  Row,
  Column,
  Text,
  Heading,
} from "@react-email/components";
import {
  EmailHeader,
  EmailBadge,
  EmailFooter,
  emailBodyStyle,
  emailContainerStyle,
  emailBodySectionStyle,
  refPillStyle,
  brandColors,
  SectionCard,
  DataRow,
  CardDivider,
  PriceRow,
  InfoBox,
} from "./components/EmailComponents";

export interface GuestBookingRequestEmailProps {
  bookingReference: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  totalAmount: string;
  nightlyTotal?: string | null;
  cleaningFee?: string | null;
  taxRate?: number | null;
  taxAmount?: string | null;
}

const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

export default function GuestBookingRequestEmail({
  bookingReference,
  propertyName,
  guestName,
  checkIn,
  checkOut,
  totalNights,
  totalAmount,
  nightlyTotal,
  cleaningFee,
  taxRate,
  taxAmount,
}: GuestBookingRequestEmailProps) {
  const taxPct = taxRate != null ? Math.round(taxRate * 100) : null;

  const steps = [
    {
      n: "1",
      text: "We will review your request and send you a Stripe Payment Link to this email address.",
    },
    {
      n: "2",
      text: "Complete your payment using the secure link to confirm your booking.",
    },
    {
      n: "3",
      text: "Once payment is received, you'll get a final booking confirmation with all details.",
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>
        We received your booking request for {propertyName} — {checkIn}
      </Preview>
      <Body style={emailBodyStyle}>
        <Container style={emailContainerStyle}>
          <EmailHeader />
          <EmailBadge
            background="#FEF3C7"
            color="#92400E"
            label="📋 Booking Request Received"
          />

          <Section style={emailBodySectionStyle}>
            <Heading
              style={{
                color: brandColors.green,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "24px",
                fontWeight: "700",
                margin: "0 0 8px",
              }}
            >
              We&apos;ve received your request, {guestName}!
            </Heading>
            <Text
              style={{
                color: brandColors.muted,
                fontFamily: sans,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: "0 0 24px",
              }}
            >
              Your dates are being held while we process your booking.
              Here&apos;s a summary of your request.
            </Text>

            {/* Your Request */}
            <SectionCard>
              <DataRow label="PROPERTY" value={propertyName} />
              <CardDivider />
              <DataRow
                label="BOOKING REFERENCE"
                value={bookingReference}
                valueStyle={refPillStyle}
              />
              <CardDivider />
              <Row>
                <Column>
                  <DataRow label="CHECK-IN" value={checkIn} />
                </Column>
                <Column>
                  <DataRow label="CHECK-OUT" value={checkOut} />
                </Column>
              </Row>
              <CardDivider />
              <DataRow
                label="DURATION"
                value={`${totalNights} night${totalNights !== 1 ? "s" : ""}`}
              />
            </SectionCard>

            {/* Cost Summary */}
            <SectionCard>
              <Text
                style={{
                  color: brandColors.bodyText,
                  fontFamily: sans,
                  fontSize: "14px",
                  fontWeight: "700",
                  margin: "0 0 12px",
                }}
              >
                Cost Summary
              </Text>
              {nightlyTotal != null && (
                <>
                  <PriceRow label="Nightly total" amount={nightlyTotal} />
                  {cleaningFee != null && (
                    <PriceRow label="Cleaning fee" amount={cleaningFee} />
                  )}
                  {taxAmount != null && taxPct !== null && (
                    <PriceRow label={`Tax (${taxPct}%)`} amount={taxAmount} />
                  )}
                </>
              )}
              <PriceRow label="Total Due" amount={totalAmount} isTotal />
            </SectionCard>

            {/* What happens next */}
            <Text
              style={{
                color: brandColors.green,
                fontFamily: sans,
                fontSize: "16px",
                fontWeight: "600",
                margin: "24px 0 16px",
              }}
            >
              What happens next
            </Text>

            {steps.map((s) => (
              <Row key={s.n} style={{ marginBottom: "14px" }}>
                <Column style={{ width: "32px", verticalAlign: "top" }}>
                  <Text
                    style={{
                      backgroundColor: brandColors.green,
                      borderRadius: "50%",
                      color: brandColors.white,
                      fontFamily: sans,
                      fontSize: "12px",
                      fontWeight: "700",
                      height: "24px",
                      lineHeight: "24px",
                      margin: "0",
                      textAlign: "center" as const,
                      width: "24px",
                      display: "block",
                    }}
                  >
                    {s.n}
                  </Text>
                </Column>
                <Column style={{ paddingLeft: "12px", verticalAlign: "top" }}>
                  <Text
                    style={{
                      color: brandColors.bodyText,
                      fontFamily: sans,
                      fontSize: "14px",
                      lineHeight: "1.5",
                      margin: "0",
                    }}
                  >
                    {s.text}
                  </Text>
                </Column>
              </Row>
            ))}

            <InfoBox type="warning">
              ⏰ Important: Your booking request will expire in 24 hours if
              payment is not completed. Please check your payment link promptly.
            </InfoBox>

            <InfoBox type="info">
              📧 Can&apos;t find our emails? Check your spam or junk folder and
              add bookings@rammiesvacation.com to your contacts.
            </InfoBox>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
