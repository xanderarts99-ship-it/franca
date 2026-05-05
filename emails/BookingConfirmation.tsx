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

export interface BookingConfirmationProps {
  bookingReference: string;
  propertyName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalNights: number;
  nightlyTotal: string | null;
  cleaningFee: string | null;
  taxRate: number | null;
  taxAmount: string | null;
  totalAmount: string;
  petFee?: string | null;
  cancellationPolicyText?: string;
  cancellationPolicyName?: string;
  checkInInstructions?: string;
}

const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

export default function BookingConfirmation({
  bookingReference,
  propertyName,
  guestName,
  checkIn,
  checkOut,
  checkInTime,
  checkOutTime,
  totalNights,
  nightlyTotal,
  cleaningFee,
  taxRate,
  taxAmount,
  totalAmount,
  petFee,
  cancellationPolicyText,
  cancellationPolicyName,
  checkInInstructions,
}: BookingConfirmationProps) {
  const taxPct = taxRate !== null ? Math.round(taxRate * 100) : null;

  return (
    <Html>
      <Head />
      <Preview>
        Your booking at {propertyName} is confirmed — Ref: {bookingReference}
      </Preview>
      <Body style={emailBodyStyle}>
        <Container style={emailContainerStyle}>
          <EmailHeader />
          <EmailBadge
            background="#DCFCE7"
            color="#166534"
            label="✅ Booking Confirmed"
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
              Your booking is confirmed, {guestName}!
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
              We look forward to welcoming you. Here are your full booking
              details.
            </Text>

            {/* Your Stay */}
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
              <Row>
                <Column>
                  <DataRow
                    label="CHECK-IN TIME"
                    value={checkInTime ?? "2:00 PM"}
                  />
                </Column>
                <Column>
                  <DataRow
                    label="CHECK-OUT TIME"
                    value={checkOutTime ?? "12:00 PM"}
                  />
                </Column>
              </Row>
              <CardDivider />
              <DataRow
                label="DURATION"
                value={`${totalNights} night${totalNights !== 1 ? "s" : ""}`}
              />
            </SectionCard>

            {/* Price Breakdown */}
            {nightlyTotal !== null && (
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
                <PriceRow label="Nightly total" amount={nightlyTotal} />
                {cleaningFee !== null && (
                  <PriceRow label="Cleaning fee" amount={cleaningFee} />
                )}
                {petFee != null && (
                  <PriceRow label="Pet fee" amount={petFee} />
                )}
                {taxAmount !== null && taxPct !== null && (
                  <PriceRow label={`Tax (${taxPct}%)`} amount={taxAmount} />
                )}
                <PriceRow label="Total Charged" amount={totalAmount} isTotal />
              </SectionCard>
            )}

            {/* Check-in Instructions */}
            {checkInInstructions && (
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
                  CHECK-IN INSTRUCTIONS
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
                  {checkInInstructions}
                </Text>
              </SectionCard>
            )}

            {/* Cancellation Policy */}
            {cancellationPolicyText && (
              <SectionCard>
                {cancellationPolicyName && (
                  <Text
                    style={{
                      backgroundColor: "#F1F5F9",
                      borderRadius: "4px",
                      color: brandColors.muted,
                      display: "inline-block",
                      fontFamily: sans,
                      fontSize: "10px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      margin: "0 0 8px",
                      padding: "2px 8px",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    {cancellationPolicyName}
                  </Text>
                )}
                <Text
                  style={{
                    color: brandColors.muted,
                    fontFamily: sans,
                    fontSize: "14px",
                    lineHeight: "1.6",
                    margin: "0",
                  }}
                >
                  {cancellationPolicyText}
                </Text>
              </SectionCard>
            )}

            <InfoBox type="warning">
              📧 Can&apos;t find this email? Please check your spam or junk
              folder and mark us as a trusted sender to receive future updates.
            </InfoBox>

            <Text
              style={{
                color: brandColors.bodyText,
                fontFamily: sans,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: "24px 0 8px",
              }}
            >
              Thank you for choosing Rammies Vacation Rentals. If you have any
              questions before your stay, please don&apos;t hesitate to reach
              out.
            </Text>
            <Text
              style={{
                color: brandColors.muted,
                fontFamily: sans,
                fontSize: "14px",
                margin: "0",
              }}
            >
              📞 346-425-2248 · ✉️ rammiesvacation@gmail.com
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
