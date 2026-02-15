import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
    Hr,
} from "@react-email/components";
import * as React from "react";

interface NotificationEmailProps {
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
}

export const NotificationEmail = ({
    title = "New Notification",
    message = "You have a new update in your portal.",
    actionUrl = "https://hobortautopartsexpress.com/portal",
    actionLabel = "View Details",
}: NotificationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>{title}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>{title}</Heading>
                    <Text style={text}>{message}</Text>

                    <Section style={btnContainer}>
                        <Button style={button} href={actionUrl}>
                            {actionLabel}
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
    backgroundColor: "#1b4e6f",
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

export default NotificationEmail;
