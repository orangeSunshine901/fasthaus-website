import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
};

export function ContactInternal({ name, email, subject, message, submittedAt }: Props) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission: {subject}</Preview>
      <Body style={{ backgroundColor: "#F8F6F3", fontFamily: "'DM Sans', sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
          <Heading style={{ fontSize: 20, fontWeight: 600, color: "#141114", marginBottom: 24 }}>
            New contact form submission
          </Heading>

          <Section style={{ backgroundColor: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
            <Text style={{ margin: 0, fontSize: 12, color: "#575757" }}>FROM</Text>
            <Text style={{ margin: "4px 0 0", fontSize: 14, color: "#141114" }}>
              {name} &lt;{email}&gt;
            </Text>
          </Section>

          <Section style={{ backgroundColor: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
            <Text style={{ margin: 0, fontSize: 12, color: "#575757" }}>SUBJECT</Text>
            <Text style={{ margin: "4px 0 0", fontSize: 14, color: "#141114" }}>{subject}</Text>
          </Section>

          <Section style={{ backgroundColor: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
            <Text style={{ margin: 0, fontSize: 12, color: "#575757" }}>MESSAGE</Text>
            <Text style={{ margin: "4px 0 0", fontSize: 14, color: "#141114", lineHeight: "22px", whiteSpace: "pre-wrap" }}>
              {message}
            </Text>
          </Section>

          <Text style={{ fontSize: 12, color: "#B0AEA9" }}>Received at {submittedAt}</Text>
        </Container>
      </Body>
    </Html>
  );
}
