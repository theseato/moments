import prisma from "~/lib/db";

type SaveCommentReq = {
  memoId: number;
  content: string;
  replyTo?: string;
  email?: string;
  website?: string;
  username: string;
  author: Boolean;
  retoken: string;

};

const secret = "";

export default defineEventHandler(async (event) => {
  const { memoId, content, replyTo, username, email, website } =
    (await readBody(event)) as SaveCommentReq;
  const userId = event.context.userId;

    if (userId === undefined) {
        const recaptcha = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${event.context.retoken}`,
        {
            method: "POST",
        }
        );
        const recaptchaResult = await recaptcha.json();
        if (!recaptchaResult.success) {
        return {
            success: false,
            message: "reCAPTCHA failed",
        };
        }
    }

  await prisma.comment.create({
    data: {
      content,
      replyTo,
      memoId,
      username,
      email,
      website,
      author: userId !== undefined
    },
  });
  return {
    success: true,
  };
});
