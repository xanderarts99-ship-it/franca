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

export interface GuestBookingRequestEmailProps {
  bookingReference: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  totalAmount: string;
}

export default function GuestBookingRequestEmail({
  bookingReference,
  propertyName,
  guestName,
  guestEmail,
  checkIn,
  checkOut,
  totalNights,
  totalAmount,
}: GuestBookingRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Booking request received — {bookingReference}</Preview>
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

          {/* Greeting */}
          <Section style={contentSection}>
            <Heading style={h1}>Booking Request Received</Heading>
            <Text style={paragraph}>
              Hi {guestName}, we&apos;ve received your booking request for{" "}
              <strong>{propertyName}</strong>. Your request is now under review.
            </Text>
          </Section>

          {/* Stay details */}
          <Section style={detailsBox}>
            <Text style={detailsTitle}>Stay Details</Text>
            <Row>
              <Column style={detailCell}>
                <Text style={detailLabel}>CHECK-IN</Text>
                <Text style={detailValue}>{checkIn}</Text>
              </Column>
              <Column style={detailCell}>
                <Text style={detailLabel}>CHECK-OUT</Text>
                <Text style={detailValue}>{checkOut}</Text>
              </Column>
            </Row>
            <Hr style={innerDivider} />
            <Row>
              <Column style={detailCell}>
                <Text style={detailLabel}>DURATION</Text>
                <Text style={detailValue}>
                  {totalNights} night{totalNights > 1 ? "s" : ""}
                </Text>
              </Column>
              <Column style={detailCell}>
                <Text style={detailLabel}>TOTAL AMOUNT</Text>
                <Text
                  style={{
                    ...detailValue,
                    color: "#1B3A6B",
                    fontWeight: "700",
                  }}
                >
                  {totalAmount}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* What happens next */}
          <Section style={contentSection}>
            <Text style={sectionHeading}>What happens next</Text>
            <Text style={paragraph}>
              Your booking request has been received. You will receive a Stripe
              Payment Link to <strong>{guestEmail}</strong> within a few hours.
              Your booking will be confirmed once payment is received.
            </Text>
            <Text style={warningBox}>
              ⏳ Important: Your request will expire in 24 hours if payment is
              not completed.
            </Text>
            <Text style={paragraph}>
              If you have any questions, simply reply to this email and
              we&apos;ll get back to you as soon as possible.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={contentSection}>
            <Text style={footer}>
              © {new Date().getFullYear()} Rammies Vacation · All rights
              reserved
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

const divider: React.CSSProperties = { borderColor: "#E8E2D9", margin: "0" };
const innerDivider: React.CSSProperties = {
  borderColor: "#E8E2D9",
  margin: "12px 0",
};

const contentSection: React.CSSProperties = { padding: "24px 40px" };

const h1: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const sectionHeading: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "15px",
  fontWeight: "700",
  margin: "0 0 8px",
  fontFamily: "sans-serif",
};

const paragraph: React.CSSProperties = {
  color: "#57534E",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 12px",
  fontFamily: "sans-serif",
};

const warningBox: React.CSSProperties = {
  backgroundColor: "#FFFBEB",
  border: "1px solid #FDE68A",
  borderRadius: "8px",
  color: "#92400E",
  fontSize: "13px",
  fontFamily: "sans-serif",
  padding: "12px 16px",
  margin: "0 0 12px",
  lineHeight: "1.5",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#F5F2EC",
  borderRadius: "8px",
  margin: "0 40px",
  padding: "20px 24px",
};

const detailsTitle: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "13px",
  fontWeight: "700",
  margin: "0 0 16px",
  fontFamily: "sans-serif",
  letterSpacing: "0.02em",
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

const footer: React.CSSProperties = {
  color: "#A8A29E",
  fontSize: "11px",
  margin: "0",
  fontFamily: "sans-serif",
};
