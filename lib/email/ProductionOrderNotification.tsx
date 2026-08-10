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

type OrderItem = {
  name: string;
  variantColor: string;
  quantity: number;
  unitPrice: number;
};

type Props = {
  orderId: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    streetAddress: string;
    line1: string;
    line2: string;
    landmark?: string;
    emirate: string;
    postalCode?: string;
  };
  total: number;
};

export function ProductionOrderNotification({
  orderId,
  customerEmail,
  customerPhone,
  items,
  shippingAddress,
  total,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>New Fasthaus order #{orderId}</Preview>
      <Body style={{ backgroundColor: "#F8F6F3", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
          <Heading style={{ fontSize: 24, color: "#141114", margin: "0 0 8px" }}>
            New paid order #{orderId}
          </Heading>
          <Text style={{ color: "#575757", margin: "0 0 24px" }}>
            Payment has been confirmed. Please begin production.
          </Text>

          <Section
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 16,
            }}
          >
            <Heading as="h2" style={{ fontSize: 16, color: "#141114", margin: "0 0 8px" }}>
              Customer
            </Heading>
            <Text style={{ color: "#575757", lineHeight: "22px", margin: 0 }}>
              {shippingAddress.firstName} {shippingAddress.lastName}
              <br />
              {customerEmail}
              {customerPhone ? ` · ${customerPhone}` : ""}
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 16,
            }}
          >
            <Heading as="h2" style={{ fontSize: 16, color: "#141114", margin: "0 0 8px" }}>
              Items
            </Heading>
            {items.map((item, index) => (
              <Text key={index} style={{ color: "#141114", lineHeight: "22px", margin: "0 0 8px" }}>
                {item.name} — {item.variantColor} × {item.quantity} (AED{" "}
                {(item.unitPrice * item.quantity).toFixed(2)})
              </Text>
            ))}
            <Text style={{ color: "#141114", fontWeight: 700, margin: "16px 0 0" }}>
              Total: AED {total.toFixed(2)}
            </Text>
          </Section>

          <Section style={{ backgroundColor: "#fff", borderRadius: 12, padding: "16px 20px" }}>
            <Heading as="h2" style={{ fontSize: 16, color: "#141114", margin: "0 0 8px" }}>
              Delivery address
            </Heading>
            <Text style={{ color: "#575757", lineHeight: "22px", margin: 0 }}>
              {shippingAddress.streetAddress}
              <br />
              {shippingAddress.line1}, {shippingAddress.line2}
              <br />
              {shippingAddress.landmark ? (
                <>
                  {shippingAddress.landmark}
                  <br />
                </>
              ) : null}
              {shippingAddress.emirate}, UAE
              {shippingAddress.postalCode ? ` ${shippingAddress.postalCode}` : ""}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
