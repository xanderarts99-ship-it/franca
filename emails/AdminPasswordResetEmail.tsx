import {
  Html,
  Head,
  Body,
  Container,
  Preview,
  Section,
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
  CTAButton,
  InfoBox,
} from "./components/EmailComponents";

export interface AdminPasswordResetEmailProps {
  resetUrl: string;
}

const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

export default function AdminPasswordResetEmail({
  resetUrl,
}: AdminPasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Rammies Vacation admin password</Preview>
      <Body style={emailBodyStyle}>
        <Container style={emailContainerStyle}>
          <EmailHeader />
          <EmailBadge
            background="#FEF3C7"
            color="#92400E"
            label="🔑 Password Reset Request"
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
              Reset your password
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
              We received a request to reset the password for your admin
              account. Click the button below to choose a new password.
            </Text>

            <CTAButton href={resetUrl}>Reset Password →</CTAButton>

            <InfoBox type="warning">
              If you did not request a password reset, you can safely ignore
              this email. Your password will not change.
            </InfoBox>

            <Text
              style={{
                color: brandColors.muted,
                fontFamily: sans,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: "16px 0 0",
                textAlign: "center" as const,
              }}
            >
              For security, this link can only be used once and expires in
              1 hour.
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
