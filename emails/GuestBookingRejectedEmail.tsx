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

export interface GuestBookingRejectedEmailProps {
  bookingReference: string;
  propertyName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  rejectionReason?: string;
}

export default function GuestBookingRejectedEmail({
  bookingReference,
  propertyName,
  guestName,
  checkIn,
  checkOut,
  rejectionReason,
}: GuestBookingRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Booking request update — {bookingReference}</Preview>
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

          {/* Main message */}
          <Section style={contentSection}>
            <Heading style={h1}>Booking Request Update</Heading>
            <Text style={paragraph}>
              Hi {guestName}, thank you for your interest in staying at{" "}
              <strong>{propertyName}</strong>.
            </Text>
            <Text style={paragraph}>
              Unfortunately we are unable to confirm your booking request for these dates.
            </Text>

            {rejectionReason && (
              <Section style={reasonBox}>
                <Text style={reasonLabel}>NOTE FROM THE HOST</Text>
                <Text style={reasonText}>{rejectionReason}</Text>
              </Section>
            )}
          </Section>

          {/* Stay details */}
          <Section style={detailsBox}>
            <Text style={detailsTitle}>Requested Stay</Text>
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
                <Text style={detailLabel}>PROPERTY</Text>
                <Text style={detailValue}>{propertyName}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Encouragement */}
          <Section style={contentSection}>
            <Text style={paragraph}>
              We hope to welcome you at another time. Please feel free to browse our
              available dates and submit a new request for dates that work for you.
            </Text>
            <Text style={paragraph}>
              If you have any questions, simply reply to this email.
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

const divider: React.CSSProperties = { borderColor: "#E8E2D9", margin: "0" };
const innerDivider: React.CSSProperties = { borderColor: "#E8E2D9", margin: "12px 0" };

const contentSection: React.CSSProperties = { padding: "24px 40px" };

const h1: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const paragraph: React.CSSProperties = {
  color: "#57534E",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 12px",
  fontFamily: "sans-serif",
};

const reasonBox: React.CSSProperties = {
  backgroundColor: "#F5F2EC",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "0 0 12px",
};

const reasonLabel: React.CSSProperties = {
  color: "#9B8E80",
  fontSize: "9px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  margin: "0 0 6px",
  fontFamily: "sans-serif",
};

const reasonText: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
  fontFamily: "sans-serif",
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

const detailCell: React.CSSProperties = { padding: "0 12px 0 0", verticalAlign: "top" };

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
  margin: "16px 0 0",
  fontFamily: "sans-serif",
};
