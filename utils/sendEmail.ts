import nodemailer from 'nodemailer';
import prisma from "~/lib/db";

type SendEmailOptions = {
    email: string;
    subject: string;
    message: string;
};

export async function sendEmail(options: SendEmailOptions) {

    const siteConfig = await prisma.config.findUnique({
        where: {
            id: 1,
        },
    });

    if(siteConfig?.enableEmail){
        const transporter = nodemailer.createTransport({
            host: siteConfig?.mailHost,
            port: siteConfig?.mailPort || 587,
            secure: siteConfig?.mailSecure || false,
            auth: {
                user: siteConfig?.mailUser,
                pass: siteConfig?.mailPass,
            },
        });

        const mailOptions = {
            from: `"${siteConfig?.mailFrom}" <${siteConfig?.mailUser}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.message,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }else{
        return { success: false, error: "Email service is not enabled" };
    }
}
