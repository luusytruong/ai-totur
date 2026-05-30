import { Resend } from 'resend';

export class EmailService {
  private transporter: Resend;

  constructor() {
    this.transporter = new Resend(process.env.RESEND_API_KEY);
  }

  async sendResetPasswordEmail(to: string, resetLink: string) {
    const html = `
      <h1>Đặt lại mật khẩu</h1>
      <p>Bạn đã yêu cầu đặt lại mật khẩu của mình.</p>
      <p>Vui lòng nhấp vào liên kết dưới đây để tiến hành đặt lại mật khẩu:</p>
      <a href="${resetLink}">Đặt lại mật khẩu</a>
      <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
    `;

    const { data, error } = await this.transporter.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: 'Đặt lại mật khẩu - Acme Inc',
      html,
    });

    if (error) {
      throw error;
    }

    return data;
  }
}
