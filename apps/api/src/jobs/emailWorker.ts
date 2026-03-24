import { emailQueue } from './emailQueue';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';

export function startEmailWorker(): void {
  emailQueue.process(async (job) => {
    const { type, email, token } = job.data;

    switch (type) {
      case 'verify':
        await sendVerificationEmail(email, token);
        console.log(`✉️  Verification email sent to ${email}`);
        break;
      case 'reset':
        await sendPasswordResetEmail(email, token);
        console.log(`✉️  Password reset email sent to ${email}`);
        break;
    }
  });

  emailQueue.on('failed', (job, err) => {
    console.error(`Email job ${job.id} failed:`, err.message);
  });

  console.log('✅ Email worker started');
}
