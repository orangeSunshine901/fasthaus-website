import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from "@react-email/components";

type Props = {
  email: string;
};

export function NewsletterWelcome({ email: _email }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the Fasthaus community</Preview>
      <Body style={{ backgroundColor: "#F8F6F3", fontFamily: "'DM Sans', sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
          <Img src="https://fasthaus.ae/fasthaus-logo-final.svg" alt="Fasthaus" height={28} style={{ marginBottom: 32 }} />

          <Heading style={{ fontSize: 24, fontWeight: 600, color: "#141114", marginBottom: 8 }}>
            Welcome to Fasthaus
          </Heading>
          <Text style={{ color: "#575757", marginBottom: 24, lineHeight: "22px" }}>
            You&apos;re now part of a small community of people who care about how a room feels.
            We&apos;ll send you new arrivals, studio stories, and the occasional lighting tip — never noise.
          </Text>

          <Button
            href="https://fasthaus.ae/shop"
            style={{
              backgroundColor: "#FF4B1F",
              color: "#fff",
              borderRadius: 999,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Shop the collection
          </Button>

          <Text style={{ fontSize: 12, color: "#B0AEA9", marginTop: 40, textAlign: "center" }}>
            © 2026 Fasthaus Studio · Dubai, UAE
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
