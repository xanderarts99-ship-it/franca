import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface ReviewRequestEmailProps {
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  reviewUrl: string;
}

export default function ReviewRequestEmail({
  guestName,
  propertyName,
  checkIn,
  checkOut,
  reviewUrl,
}: ReviewRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>How was your stay at {propertyName}?</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={brandName}>Rammies Vacation</Text>
          </Section>

          <Section style={contentSection}>
            <Heading style={h1}>How was your stay at {propertyName}?</Heading>
            <Text style={paragraph}>
              Hi {guestName}, we hope you had a wonderful time! Your feedback means a lot to
              us and helps future guests make informed decisions.
            </Text>

            <Section style={stayBox}>
              <Text style={stayLabel}>YOUR STAY</Text>
              <Text style={stayProperty}>{propertyName}</Text>
              <Text style={stayDates}>
                {checkIn} — {checkOut}
              </Text>
            </Section>

            <Section style={starsRow}>
              {Array.from({ length: 5 }, (_, i) => (
                <Text key={i} style={starStyle}>☆</Text>
              ))}
            </Section>

            <Button style={ctaButton} href={reviewUrl}>
              Leave a Review
            </Button>

            <Text style={note}>
              This link is unique to your booking and can only be used once.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={contentSection}>
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

const contentSection: React.CSSProperties = {
  padding: "32px 40px",
};

const h1: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: "#57534E",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 24px",
  fontFamily: "sans-serif",
};

const stayBox: React.CSSProperties = {
  backgroundColor: "#F5F2EC",
  borderRadius: "8px",
  padding: "16px 20px",
  marginBottom: "24px",
};

const stayLabel: React.CSSProperties = {
  color: "#9B8E80",
  fontSize: "9px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  margin: "0 0 4px",
  fontFamily: "sans-serif",
};

const stayProperty: React.CSSProperties = {
  color: "#1C1917",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0 0 4px",
  fontFamily: "sans-serif",
};

const stayDates: React.CSSProperties = {
  color: "#57534E",
  fontSize: "13px",
  margin: "0",
  fontFamily: "sans-serif",
};

const starsRow: React.CSSProperties = {
  display: "flex" as const,
  flexDirection: "row" as const,
  gap: "4px",
  marginBottom: "24px",
};

const starStyle: React.CSSProperties = {
  fontSize: "28px",
  color: "#D4B896",
  margin: "0 2px 0 0",
  display: "inline",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#B5956A",
  borderRadius: "100px",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 32px",
  marginBottom: "20px",
  fontFamily: "sans-serif",
};

const note: React.CSSProperties = {
  color: "#9B8E80",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
  fontFamily: "sans-serif",
  fontStyle: "italic",
};

const divider: React.CSSProperties = {
  borderColor: "#E8E2D9",
  margin: "0",
};

const footer: React.CSSProperties = {
  color: "#A8A29E",
  fontSize: "11px",
  margin: "0",
  fontFamily: "sans-serif",
};
