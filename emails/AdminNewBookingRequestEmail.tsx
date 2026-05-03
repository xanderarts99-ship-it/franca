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
  Link,
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
  CTAButton,
  InfoBox,
} from "./components/EmailComponents";

export interface AdminNewBookingRequestEmailProps {
  bookingReference: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  totalAmount: string;
  bookingUrl: string;
  nightlyTotal?: string | null;
  cleaningFee?: string | null;
  taxRate?: number | null;
  taxAmount?: string | null;
}

const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

export default function AdminNewBookingRequestEmail({
  bookingReference,
  propertyName,
  guestName,
  guestEmail,
  guestPhone,
  checkIn,
  checkOut,
  totalNights,
  totalAmount,
  bookingUrl,
  nightlyTotal,
  cleaningFee,
  taxRate,
  taxAmount,
}: AdminNewBookingRequestEmailProps) {
  const taxPct = taxRate != null ? Math.round(taxRate * 100) : null;

  return (
    <Html>
      <Head />
      <Preview>
        New booking request — ${totalAmount} — {guestName} — {propertyName}
      </Preview>
      <Body style={emailBodyStyle}>
        <Container style={emailContainerStyle}>
          <EmailHeader />
          <EmailBadge
            background="#DBEAFE"
            color="#1E40AF"
            label="🔔 New Booking Request"
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
              New booking request received
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
              A guest has submitted a booking request. Review the details below
              and send them a Stripe Payment Link for the exact amount shown.
            </Text>

            {/* Amount highlight */}
            <Section
              style={{
                backgroundColor: brandColors.green,
                borderRadius: "12px",
                padding: "32px 48px",
                textAlign: "center",
                marginBottom: "24px",
              }}
            >
              <Text
                style={{
                  color: brandColors.gold,
                  fontFamily: sans,
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "2px",
                  textTransform: "uppercase" as const,
                  margin: "0 0 8px",
                  textAlign: "center",
                }}
              >
                AMOUNT TO CHARGE
              </Text>
              <Text
                style={{
                  color: brandColors.white,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "48px",
                  fontWeight: "700",
                  margin: "0 0 8px",
                  textAlign: "center",
                }}
              >
                {totalAmount}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: sans,
                  fontSize: "13px",
                  margin: "0",
                  textAlign: "center",
                }}
              >
                Create a Stripe Payment Link for this exact amount
              </Text>
            </Section>

            {/* Guest Information */}
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
                Guest Information
              </Text>
              <DataRow label="GUEST NAME" value={guestName} />
              <CardDivider />
              <Text
                style={{
                  color: brandColors.muted,
                  fontFamily: sans,
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  textTransform: "uppercase" as const,
                  margin: "0 0 4px",
                }}
              >
                EMAIL
              </Text>
              <Link
                href={`mailto:${guestEmail}`}
                style={{
                  color: brandColors.green,
                  fontFamily: sans,
                  fontSize: "16px",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                {guestEmail}
              </Link>
              <CardDivider />
              <Text
                style={{
                  color: brandColors.muted,
                  fontFamily: sans,
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  textTransform: "uppercase" as const,
                  margin: "0 0 4px",
                }}
              >
                PHONE
              </Text>
              <Link
                href={`tel:${guestPhone}`}
                style={{
                  color: brandColors.green,
                  fontFamily: sans,
                  fontSize: "16px",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                {guestPhone}
              </Link>
            </SectionCard>

            {/* Booking Details */}
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
                Booking Details
              </Text>
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

            {/* Price Breakdown */}
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
                Price Breakdown
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
              <PriceRow label="Total to charge" amount={totalAmount} isTotal />
            </SectionCard>

            <CTAButton href={bookingUrl}>
              View Booking in Dashboard →
            </CTAButton>

            <InfoBox type="warning">
              ⏰ This request expires in 24 hours. Please review and send the
              payment link promptly.
            </InfoBox>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
