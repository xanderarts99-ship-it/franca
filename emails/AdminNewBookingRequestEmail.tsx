import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

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
}

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
}: AdminNewBookingRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New booking request — {guestName} · {totalAmount}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brandName}>Rammies Vacation · Admin</Text>
          </Section>

          {/* Alert banner */}
          <Section style={alertBanner}>
            <Text style={alertText}>🔔 New Booking Request</Text>
          </Section>

          {/* Amount — prominent */}
          <Section style={amountSection}>
            <Text style={amountLabel}>AMOUNT TO CHARGE</Text>
            <Text style={amountValue}>{totalAmount}</Text>
            <Text style={amountSub}>Create a Stripe Payment Link for this exact amount</Text>
          </Section>

          <Hr style={divider} />

          {/* Booking details */}
          <Section style={contentSection}>
            <Heading style={h2}>Booking Details</Heading>
          </Section>

          <Section style={detailsBox}>
            <Text style={detailsTitle}>Stay</Text>
            <Row>
              <Column style={detailCell}>
                <Text style={detailLabel}>PROPERTY</Text>
                <Text style={detailValue}>{propertyName}</Text>
              </Column>
              <Column style={detailCell}>
                <Text style={detailLabel}>REFERENCE</Text>
                <Text style={{ ...detailValue, fontFamily: "monospace" }}>{bookingReference}</Text>
              </Column>
            </Row>
            <Hr style={innerDivider} />
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
                <Text style={detailLabel}>NIGHTS</Text>
                <Text style={detailValue}>{totalNights}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={{ ...detailsBox, marginTop: "12px" }}>
            <Text style={detailsTitle}>Guest</Text>
            <Row>
              <Column style={detailCell}>
                <Text style={detailLabel}>NAME</Text>
                <Text style={detailValue}>{guestName}</Text>
              </Column>
              <Column style={detailCell}>
                <Text style={detailLabel}>PHONE</Text>
                <Text style={detailValue}>{guestPhone}</Text>
              </Column>
            </Row>
            <Hr style={innerDivider} />
            <Row>
              <Column style={detailCell}>
                <Text style={detailLabel}>EMAIL</Text>
                <Text style={detailValue}>{guestEmail}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Instructions */}
          <Section style={contentSection}>
            <Text style={sectionHeading}>To confirm this booking:</Text>
            <Text style={step}>1. Create a Stripe Payment Link for exactly {totalAmount}</Text>
            <Text style={step}>2. Send it to {guestEmail}</Text>
            <Text style={step}>3. Once payment is received, confirm the booking in your dashboard</Text>

            <Section style={{ marginTop: "20px", textAlign: "center" }}>
              <Link href={bookingUrl} style={ctaButton}>
                View Booking in Dashboard →
              </Link>
            </Section>

            <Text style={urgentNote}>
              ⚠️ This request expires in 24 hours. Confirm promptly to secure the booking.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={contentSection}>
            <Text style={footer}>
              © {new Date().getFullYear()} Rammies Vacation · Admin notification
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

const alertBanner: React.CSSProperties = {
  backgroundColor: "#FFFBEB",
  borderBottom: "1px solid #FDE68A",
  padding: "12px 40px",
  textAlign: "center",
};

const alertText: React.CSSProperties = {
  color: "#92400E",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0",
  fontFamily: "sans-serif",
  letterSpacing: "0.01em",
};

const amountSection: React.CSSProperties = {
  textAlign: "center",
  padding: "32px 40px 24px",
};

const amountLabel: React.CSSProperties = {
  color: "#9B8E80",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  margin: "0 0 8px",
  fontFamily: "sans-serif",
};

const amountValue: React.CSSProperties = {
  color: "#1B3A6B",
  fontSize: "44px",
  fontWeight: "700",
  margin: "0 0 4px",
  fontFamily: "sans-serif",
};

const amountSub: React.CSSProperties = {
  color: "#57534E",
  fontSize: "13px",
  margin: "0",
  fontFamily: "sans-serif",
};

const divider: React.CSSProperties = { borderColor: "#E8E2D9", margin: "0" };
const innerDivider: React.CSSProperties = { borderColor: "#E8E2D9", margin: "12px 0" };

const contentSection: React.CSSProperties = { padding: "24px 40px" };

const h2: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0",
};

const sectionHeading: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "15px",
  fontWeight: "700",
  margin: "0 0 12px",
  fontFamily: "sans-serif",
};

const step: React.CSSProperties = {
  color: "#57534E",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 6px",
  fontFamily: "sans-serif",
  paddingLeft: "4px",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#1B3A6B",
  borderRadius: "100px",
  color: "#FFFFFF",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  fontFamily: "sans-serif",
  padding: "12px 28px",
  textDecoration: "none",
};

const urgentNote: React.CSSProperties = {
  backgroundColor: "#FEF2F2",
  border: "1px solid #FECACA",
  borderRadius: "8px",
  color: "#991B1B",
  fontSize: "13px",
  fontFamily: "sans-serif",
  padding: "12px 16px",
  margin: "20px 0 0",
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
  margin: "0",
  fontFamily: "sans-serif",
};
