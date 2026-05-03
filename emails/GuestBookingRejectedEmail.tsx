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
  CTAButton,
} from "./components/EmailComponents";

export interface GuestBookingRejectedEmailProps {
  bookingReference: string;
  propertyName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  rejectionReason?: string;
  siteUrl: string;
}

const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

export default function GuestBookingRejectedEmail({
  bookingReference,
  propertyName,
  guestName,
  checkIn,
  checkOut,
  rejectionReason,
  siteUrl,
}: GuestBookingRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Update on your booking request — {bookingReference}</Preview>
      <Body style={emailBodyStyle}>
        <Container style={emailContainerStyle}>
          <EmailHeader />
          <EmailBadge
            background="#FEE2E2"
            color="#991B1B"
            label="❌ Booking Request Update"
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
              Hi {guestName},
            </Heading>
            <Text
              style={{
                color: brandColors.bodyText,
                fontFamily: sans,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: "0 0 24px",
              }}
            >
              Thank you for your interest in staying with Rammies Vacation
              Rentals. Unfortunately, we are unable to confirm your booking
              request for the following dates.
            </Text>

            {/* Request Summary */}
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
            </SectionCard>

            {/* Rejection reason */}
            {rejectionReason && (
              <SectionCard>
                <Text
                  style={{
                    color: brandColors.muted,
                    fontFamily: sans,
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                    textTransform: "uppercase" as const,
                    margin: "0 0 8px",
                  }}
                >
                  NOTE FROM HOST
                </Text>
                <Text
                  style={{
                    color: brandColors.bodyText,
                    fontFamily: sans,
                    fontSize: "15px",
                    lineHeight: "1.6",
                    margin: "0",
                  }}
                >
                  {rejectionReason}
                </Text>
              </SectionCard>
            )}

            <Text
              style={{
                color: brandColors.bodyText,
                fontFamily: sans,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: "24px 0 0",
                textAlign: "center" as const,
              }}
            >
              We encourage you to browse our other available properties and
              dates. We&apos;d love to host you on a future visit.
            </Text>

            <CTAButton href={siteUrl}>
              Browse Available Properties →
            </CTAButton>

            <Text
              style={{
                color: brandColors.muted,
                fontFamily: sans,
                fontSize: "14px",
                margin: "0",
                textAlign: "center" as const,
              }}
            >
              If you have any questions, please contact us at
              rammiesvacation@gmail.com or call 346-425-2248.
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
