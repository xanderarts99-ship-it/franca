import {
  Section,
  Row,
  Column,
  Text,
  Hr,
  Button,
} from "@react-email/components";

// ── Brand tokens ──────────────────────────────────────────────────────

export const brandColors = {
  green: "#1B4332",
  gold: "#C9A84C",
  bg: "#F8F5F0",
  white: "#FFFFFF",
  bodyText: "#1E293B",
  muted: "#64748B",
  border: "#E2E8F0",
};

const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
const serif = "Georgia, 'Times New Roman', serif";

// ── Shared layout styles (exported for use in every template) ─────────

export const emailBodyStyle: React.CSSProperties = {
  backgroundColor: brandColors.bg,
  margin: "0",
  padding: "40px 0",
};

export const emailContainerStyle: React.CSSProperties = {
  backgroundColor: brandColors.white,
  borderRadius: "12px",
  maxWidth: "600px",
  margin: "0 auto",
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

export const emailBodySectionStyle: React.CSSProperties = {
  backgroundColor: brandColors.white,
  padding: "40px 48px",
};

// ── Reference pill style (used for booking reference values) ──────────

export const refPillStyle: React.CSSProperties = {
  backgroundColor: "#F1F5F9",
  borderRadius: "8px",
  color: brandColors.green,
  display: "inline-block",
  fontFamily: "Courier New, monospace",
  fontSize: "14px",
  fontWeight: "700",
  padding: "4px 12px",
};

// ── Header ────────────────────────────────────────────────────────────

export function EmailHeader() {
  return (
    <Section style={headerStyle}>
      <Text style={headerBrandStyle}>RAMMIES</Text>
      <Text style={headerTaglineStyle}>VACATION RENTALS</Text>
    </Section>
  );
}

const headerStyle: React.CSSProperties = {
  backgroundColor: brandColors.green,
  padding: "24px 48px",
  textAlign: "center",
};

const headerBrandStyle: React.CSSProperties = {
  color: brandColors.white,
  fontFamily: serif,
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "3px",
  margin: "0 0 4px",
  textAlign: "center",
};

const headerTaglineStyle: React.CSSProperties = {
  color: brandColors.gold,
  fontFamily: sans,
  fontSize: "11px",
  fontWeight: "600",
  letterSpacing: "4px",
  textTransform: "uppercase" as const,
  margin: "0",
  textAlign: "center",
};

// ── Badge (type strip below header) ───────────────────────────────────

export function EmailBadge({
  background,
  color,
  label,
}: {
  background: string;
  color: string;
  label: string;
}) {
  return (
    <Section
      style={{
        backgroundColor: background,
        padding: "14px 48px",
        textAlign: "center",
      }}
    >
      <Text
        style={{
          color,
          fontFamily: sans,
          fontSize: "13px",
          fontWeight: "600",
          letterSpacing: "1px",
          textTransform: "uppercase" as const,
          margin: "0",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────

export function EmailFooter() {
  return (
    <Section style={footerStyle}>
      <Hr
        style={{
          borderColor: brandColors.gold,
          borderTopWidth: "3px",
          margin: "0 0 24px",
        }}
      />
      <Text
        style={{
          color: brandColors.white,
          fontFamily: sans,
          fontSize: "12px",
          margin: "0 0 6px",
          textAlign: "center",
        }}
      >
        © 2025 Rammies Vacation Rentals. All rights reserved.
      </Text>
      <Text
        style={{
          color: brandColors.gold,
          fontFamily: sans,
          fontSize: "12px",
          margin: "0 0 6px",
          textAlign: "center",
        }}
      >
        rammiesvacation@gmail.com · 346-425-2248
      </Text>
      <Text
        style={{
          color: brandColors.white,
          fontFamily: sans,
          fontSize: "11px",
          margin: "0",
          textAlign: "center",
        }}
      >
        www.rammiesvacation.com
      </Text>
    </Section>
  );
}

const footerStyle: React.CSSProperties = {
  backgroundColor: brandColors.green,
  padding: "32px 48px",
  textAlign: "center",
};

// ── SectionCard ───────────────────────────────────────────────────────

export function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Section
      style={{
        backgroundColor: brandColors.white,
        border: `1px solid ${brandColors.border}`,
        borderRadius: "8px",
        padding: "24px",
        marginBottom: "16px",
        ...style,
      }}
    >
      {children}
    </Section>
  );
}

// ── DataRow ───────────────────────────────────────────────────────────

export function DataRow({
  label,
  value,
  large,
  valueStyle,
}: {
  label: string;
  value: string | number;
  large?: boolean;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <>
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
        {label}
      </Text>
      <Text
        style={{
          color: brandColors.bodyText,
          fontFamily: sans,
          fontSize: large ? "20px" : "16px",
          fontWeight: "600",
          margin: "0",
          ...valueStyle,
        }}
      >
        {value}
      </Text>
    </>
  );
}

// ── CardDivider ───────────────────────────────────────────────────────

export function CardDivider() {
  return (
    <Hr style={{ borderColor: brandColors.border, margin: "16px 0" }} />
  );
}

// ── PriceRow ──────────────────────────────────────────────────────────

export function PriceRow({
  label,
  amount,
  isTotal,
  isMuted,
}: {
  label: string;
  amount: string;
  isTotal?: boolean;
  isMuted?: boolean;
}) {
  const color = isTotal
    ? brandColors.green
    : isMuted
    ? brandColors.muted
    : brandColors.bodyText;
  const fontSize = isTotal ? "18px" : "14px";
  const fontWeight = isTotal ? "700" : "400";

  return (
    <>
      {isTotal && (
        <Hr style={{ borderColor: brandColors.border, margin: "8px 0" }} />
      )}
      <Row style={{ marginBottom: isTotal ? "0" : "8px" }}>
        <Column>
          <Text
            style={{
              color,
              fontFamily: sans,
              fontSize,
              fontWeight,
              margin: "0",
            }}
          >
            {label}
          </Text>
        </Column>
        <Column style={{ textAlign: "right" as const }}>
          <Text
            style={{
              color,
              fontFamily: sans,
              fontSize,
              fontWeight,
              margin: "0",
              textAlign: "right" as const,
            }}
          >
            {amount}
          </Text>
        </Column>
      </Row>
    </>
  );
}

// ── CTAButton ─────────────────────────────────────────────────────────

export function CTAButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
      <Button
        href={href}
        style={{
          backgroundColor: brandColors.gold,
          borderRadius: "8px",
          color: brandColors.white,
          display: "inline-block",
          fontFamily: sans,
          fontSize: "16px",
          fontWeight: "700",
          letterSpacing: "0.5px",
          padding: "16px 32px",
          textDecoration: "none",
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

// ── InfoBox ───────────────────────────────────────────────────────────

export function InfoBox({
  type,
  children,
}: {
  type: "info" | "warning" | "success";
  children: React.ReactNode;
}) {
  const bg = { info: "#EFF6FF", warning: "#FEF3C7", success: "#DCFCE7" };
  const border = { info: "#3B82F6", warning: "#F59E0B", success: "#16A34A" };

  return (
    <Section
      style={{
        backgroundColor: bg[type],
        borderLeft: `4px solid ${border[type]}`,
        borderRadius: "0 8px 8px 0",
        margin: "16px 0",
        padding: "16px 20px",
      }}
    >
      <Text
        style={{
          color: brandColors.bodyText,
          fontFamily: sans,
          fontSize: "14px",
          lineHeight: "1.5",
          margin: "0",
        }}
      >
        {children}
      </Text>
    </Section>
  );
}
