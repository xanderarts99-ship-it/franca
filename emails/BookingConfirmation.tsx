import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

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
  cancellationPolicyText?: string;
}

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
  cancellationPolicyText,
}: BookingConfirmationProps) {
  const taxPct = taxRate !== null ? Math.round(taxRate * 100) : null;

  return (
    <Html>
      <Head />
      <Preview>Booking confirmed — {bookingReference}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brandName}>Rammies Vacation</Text>
          </Section>

          {/* Reference badge */}
          <Section style={refSection}>
            <Text style={refLabel}>BOOKING REFERENCE</Text>
            <Text style={refCode}>{bookingReference}</Text>
          </Section>

          <Hr style={divider} />

          {/* Payment received note */}
          <Section style={paymentNote}>
            <Text style={paymentNoteText}>
              ✓ Your payment has been received and your booking is officially confirmed.
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={contentSection}>
            <Heading style={h1}>Your booking is confirmed!</Heading>
            <Text style={paragraph}>
              Hi {guestName}, great news — your stay at{" "}
              <strong>{propertyName}</strong> has been confirmed. We look
              forward to welcoming you.
            </Text>
          </Section>

          {/* Stay details */}
          <Section style={detailsBox}>
            <Text style={detailsTitle}>Stay Details</Text>
            <Row>
              <Column style={detailCell}>
                <Text style={detailLabel}>CHECK-IN</Text>
                <Text style={detailValue}>{checkIn}</Text>
                {checkInTime && (
                  <Text style={detailSub}>From {checkInTime}</Text>
                )}
              </Column>
              <Column style={detailCell}>
                <Text style={detailLabel}>CHECK-OUT</Text>
                <Text style={detailValue}>{checkOut}</Text>
                {checkOutTime && (
                  <Text style={detailSub}>By {checkOutTime}</Text>
                )}
              </Column>
            </Row>
            <Hr style={innerDivider} />

            {/* Price breakdown */}
            {nightlyTotal !== null ? (
              <>
                <Row>
                  <Column style={detailCell}>
                    <Text style={detailLabel}>DURATION</Text>
                    <Text style={detailValue}>
                      {totalNights} night{totalNights > 1 ? "s" : ""}
                    </Text>
                  </Column>
                  <Column style={detailCell}>
                    <Text style={detailLabel}>NIGHTLY TOTAL</Text>
                    <Text style={detailValue}>{nightlyTotal}</Text>
                  </Column>
                </Row>
                {(cleaningFee !== null || taxAmount !== null) && (
                  <>
                    <Hr style={innerDivider} />
                    <Row>
                      {cleaningFee !== null && (
                        <Column style={detailCell}>
                          <Text style={detailLabel}>CLEANING FEE</Text>
                          <Text style={detailValue}>{cleaningFee}</Text>
                        </Column>
                      )}
                      {taxAmount !== null && taxPct !== null && (
                        <Column style={detailCell}>
                          <Text style={detailLabel}>TAX ({taxPct}%)</Text>
                          <Text style={detailValue}>{taxAmount}</Text>
                        </Column>
                      )}
                    </Row>
                  </>
                )}
                <Hr style={innerDivider} />
                <Row>
                  <Column style={detailCell}>
                    <Text style={detailLabel}>TOTAL CHARGED</Text>
                    <Text style={{ ...detailValue, color: "#1B3A6B", fontWeight: "700" }}>
                      {totalAmount}
                    </Text>
                  </Column>
                </Row>
              </>
            ) : (
              <Row>
                <Column style={detailCell}>
                  <Text style={detailLabel}>DURATION</Text>
                  <Text style={detailValue}>
                    {totalNights} night{totalNights > 1 ? "s" : ""}
                  </Text>
                </Column>
                <Column style={detailCell}>
                  <Text style={detailLabel}>TOTAL CHARGED</Text>
                  <Text style={{ ...detailValue, color: "#1B3A6B", fontWeight: "700" }}>
                    {totalAmount}
                  </Text>
                </Column>
              </Row>
            )}
          </Section>

          {/* Cancellation policy */}
          {cancellationPolicyText && (
            <>
              <Hr style={divider} />
              <Section style={contentSection}>
                <Text style={sectionTitle}>Cancellation Policy</Text>
                <Text style={paragraph}>{cancellationPolicyText}</Text>
              </Section>
            </>
          )}

          <Hr style={divider} />

          {/* Footer note */}
          <Section style={contentSection}>
            <Text style={paragraph}>
              If you have any questions about your reservation, please contact us
              and reference your booking number above.
            </Text>
            <Text style={footer}>
              © {new Date().getFullYear()} Rammies Vacation · All rights reserved
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#F5F2EC",
  fontFamily: "'Georgia', serif",
  margin: "0",
  padding: "40px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  maxWidth: "560px",
  margin: "0 auto",
  overflow: "hidden",
  border: "1px solid #E8E2D9",
};

const header: React.CSSProperties = {
  backgroundColor: "#0F2945",
  padding: "28px 40px",
};

const brandName: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0",
  letterSpacing: "0.02em",
};

const refSection: React.CSSProperties = {
  padding: "28px 40px 20px",
  textAlign: "center",
};

const refLabel: React.CSSProperties = {
  color: "#9B8E80",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  margin: "0 0 8px",
  fontFamily: "sans-serif",
};

const refCode: React.CSSProperties = {
  color: "#1B3A6B",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "0.06em",
  margin: "0",
  fontFamily: "monospace",
};

const divider: React.CSSProperties = {
  borderColor: "#E8E2D9",
  margin: "0",
};

const innerDivider: React.CSSProperties = {
  borderColor: "#E8E2D9",
  margin: "12px 0",
};

const contentSection: React.CSSProperties = {
  padding: "24px 40px",
};

const h1: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const sectionTitle: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 8px",
  fontFamily: "sans-serif",
  letterSpacing: "0.02em",
};

const paragraph: React.CSSProperties = {
  color: "#57534E",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 8px",
  fontFamily: "sans-serif",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#F5F2EC",
  borderRadius: "8px",
  margin: "0 40px",
  padding: "20px 24px",
};

const detailCell: React.CSSProperties = {
  padding: "0 12px 0 0",
  verticalAlign: "top",
};

const detailLabel: React.CSSProperties = {
  color: "#9B8E80",
  fontSize: "9px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  margin: "0 0 4px",
  fontFamily: "sans-serif",
};

const detailValue: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  fontFamily: "sans-serif",
};

const detailSub: React.CSSProperties = {
  color: "#9B8E80",
  fontSize: "11px",
  margin: "2px 0 0",
  fontFamily: "sans-serif",
};

const paymentNote: React.CSSProperties = {
  backgroundColor: "#F0FDF4",
  borderBottom: "1px solid #BBF7D0",
  padding: "12px 40px",
  textAlign: "center",
};

const paymentNoteText: React.CSSProperties = {
  color: "#166534",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0",
  fontFamily: "sans-serif",
};

const footer: React.CSSProperties = {
  color: "#A8A29E",
  fontSize: "11px",
  margin: "16px 0 0",
  fontFamily: "sans-serif",
};
