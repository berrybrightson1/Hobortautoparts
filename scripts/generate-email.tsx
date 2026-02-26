import { render } from '@react-email/components';
import WelcomeEmail from '../src/emails/WelcomeEmail';
import * as fs from 'fs';
import * as path from 'path';

async function generateHtml() {
    try {
        const html = await render(<WelcomeEmail firstName="TestUser" />);
        const outputPath = path.join(__dirname, '../WelcomeEmail.html');
        fs.writeFileSync(outputPath, html);
        console.log(`Email successfully generated at: ${outputPath}`);
    } catch (e) {
        console.error('Failed to generate email:', e);
    }
}

generateHtml();
