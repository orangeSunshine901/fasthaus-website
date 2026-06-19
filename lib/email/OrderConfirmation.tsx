import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

type OrderItem = {
  name: string;
  variantColor: string;
  quantity: number;
  unitPrice: number;
};

type Props = {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string;
    emirate: string;
    postalCode?: string;
  };
  total: number;
};

export function OrderConfirmation({ orderId, customerName, items, shippingAddress, total }: Props) {
  const addr = shippingAddress;

  return (
    <Html>
      <Head />
      <Preview>Your Fasthaus order #{orderId} is confirmed</Preview>
      <Body style={{ backgroundColor: "#F8F6F3", fontFamily: "'DM Sans', sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
          <Img src="https://fasthaus.ae/fasthaus-logo-final.svg" alt="Fasthaus" height={28} style={{ marginBottom: 32 }} />

          <Heading style={{ fontSize: 24, fontWeight: 600, color: "#141114", marginBottom: 8 }}>
            Order confirmed
          </Heading>
          <Text style={{ color: "#575757", marginBottom: 24 }}>
            Hi {customerName}, thank you for your order. We&apos;re getting it ready.
          </Text>

          <Text style={{ fontSize: 12, color: "#575757", marginBottom: 4 }}>ORDER NUMBER</Text>
          <Text style={{ fontSize: 16, fontWeight: 600, color: "#141114", marginBottom: 24 }}>
            #{orderId}
          </Text>

          <Section style={{ backgroundColor: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
            <Heading as="h3" style={{ fontSize: 14, fontWeight: 600, color: "#141114", marginBottom: 12 }}>
              Items ordered
            </Heading>
            {items.map((item, i) => (
              <Row key={i} style={{ marginBottom: 12 }}>
                <Column>
                  <Text style={{ margin: 0, fontSize: 14, color: "#141114" }}>
                    {item.name}
                  </Text>
                  <Text style={{ margin: 0, fontSize: 12, color: "#575757" }}>
                    {item.variantColor} × {item.quantity}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ margin: 0, fontSize: 14, color: "#141114" }}>
                    AED {(item.unitPrice * item.quantity).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
            <Hr style={{ borderColor: "#E5E5E5", margin: "12px 0" }} />
            <Row>
              <Column>
                <Text style={{ margin: 0, fontSize: 14, color: "#575757" }}>Shipping</Text>
              </Column>
              <Column align="right">
                <Text style={{ margin: 0, fontSize: 14, color: "#2E7D5E", fontWeight: 600 }}>Free</Text>
              </Column>
            </Row>
            <Row style={{ marginTop: 8 }}>
              <Column>
                <Text style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#141114" }}>Total</Text>
              </Column>
              <Column align="right">
                <Text style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#141114" }}>
                  AED {total.toFixed(2)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={{ backgroundColor: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 32 }}>
            <Heading as="h3" style={{ fontSize: 14, fontWeight: 600, color: "#141114", marginBottom: 8 }}>
              Shipping to
            </Heading>
            <Text style={{ margin: 0, fontSize: 14, color: "#575757", lineHeight: "22px" }}>
              {addr.firstName} {addr.lastName}<br />
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
              {addr.emirate}, UAE{addr.postalCode ? ` ${addr.postalCode}` : ""}
            </Text>
          </Section>

          <Text style={{ fontSize: 12, color: "#B0AEA9", textAlign: "center" }}>
            © 2026 Fasthaus Studio · Dubai, UAE
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
