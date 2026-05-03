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
  brandColors,
  SectionCard,
  DataRow,
  CardDivider,
  CTAButton,
  InfoBox,
} from "./components/EmailComponents";

export interface ReviewRequestEmailProps {
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  reviewUrl: string;
}

const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

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
      <Body style={emailBodyStyle}>
        <Container style={emailContainerStyle}>
          <EmailHeader />
          <EmailBadge
            background="#F3E8FF"
            color="#6B21A8"
            label="⭐ Share Your Experience"
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
              Hi {guestName}, how was your stay?
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
              We hope you had a wonderful time at {propertyName}. Your feedback
              means the world to us and helps future guests find their perfect
              home away from home.
            </Text>

            {/* Your Recent Stay */}
            <SectionCard>
              <DataRow label="PROPERTY" value={propertyName} />
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

            {/* Star Rating Visual */}
            <Section
              style={{
                padding: "32px 0",
                textAlign: "center" as const,
              }}
            >
              <Text
                style={{
                  color: brandColors.gold,
                  fontSize: "32px",
                  letterSpacing: "8px",
                  margin: "0 0 12px",
                  textAlign: "center" as const,
                }}
              >
                ⭐⭐⭐⭐⭐
              </Text>
              <Text
                style={{
                  color: brandColors.muted,
                  fontFamily: sans,
                  fontSize: "14px",
                  margin: "0",
                  textAlign: "center" as const,
                }}
              >
                Click the button below to rate your stay
              </Text>
            </Section>

            <CTAButton href={reviewUrl}>Leave a Review ✍️</CTAButton>

            <InfoBox type="info">
              🔒 This review link is unique to your booking and can only be
              used once. It will not ask you to create an account.
            </InfoBox>

            <Text
              style={{
                color: brandColors.muted,
                fontFamily: sans,
                fontSize: "14px",
                lineHeight: "1.6",
                margin: "24px 0 0",
                textAlign: "center" as const,
              }}
            >
              Thank you for choosing Rammies Vacation Rentals. We hope to
              welcome you back soon!
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
