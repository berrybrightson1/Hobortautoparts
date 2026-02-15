import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Button,
    Hr,
    Img,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    name: string;
    role: string;
}

export const WelcomeEmail = ({
    name = "Valued Partner",
    role = "customer",
}: WelcomeEmailProps) => {
    const isAgent = role === "agent";

    return (
        <Html>
            <Head />
            <Preview>Welcome to Hobort Auto Parts Express!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Welcome, {name}!</Heading>
                    <Text style={text}>
                        Thank you for joining <strong>Hobort Auto Parts Express</strong>.
                        We are thrilled to have you on board.
                    </Text>

                    <Text style={text}>
                        {isAgent
                            ? "Your agent application has been received and is currently under review. We will notify you via email once your account is approved."
                            : "You can now browse our catalog, request quotes for specific parts, and track your shipments in real-time."}
                    </Text>

                    <Section style={btnContainer}>
                        <Button
                            style={button}
                            href="https://hobortautopartsexpress.com/portal"
                        >
                            Go to Dashboard
                        </Button>
                    </Section>

                    <Hr style={hr} />

                    <Text style={footer}>
                        Hobort Auto Parts Express - Global Auto Parts Sourcing
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "560px",
};

const h1 = {
    color: "#1b4e6f",
    fontSize: "24px",
    fontWeight: "bold",
    paddingTop: "32px",
    paddingBottom: "16px",
};

const text = {
    color: "#333",
    fontSize: "16px",
    lineHeight: "26px",
};

const btnContainer = {
    textAlign: "center" as const,
    marginTop: "32px",
    marginBottom: "32px",
};

const button = {
    backgroundColor: "#fe8323",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
};

const hr = {
    borderColor: "#cccccc",
    margin: "20px 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
};

export default WelcomeEmail;
