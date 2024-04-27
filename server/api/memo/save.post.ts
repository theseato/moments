import prisma from "~/lib/db";
import { aliTextJudge } from '~/utils/aliTextJudge';

type SaveMemoReq = {
  id?: number;
  content: string;
  imgUrls?: string[];
  music163Url?: string;
  bilibiliUrl?: string;
  location?: string;
  externalUrl?: string;
  externalTitle?: string;
  externalFavicon?: string;
};

const staticWord = {
  'ad': '广告引流',
  'political_content': '涉政内容',
  'profanity': '辱骂内容',
  'contraband': '违禁内容',
  'sexual_content': '色情内容',
  'violence': '暴恐内容',
  'nonsense': '无意义内容',
  'negative_content': '不良内容',
  'religion': '宗教内容',
  'cyberbullying': '网络暴力',
  'ad_compliance': '广告法合规',
  'C_customized': '违反本站规定',
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as SaveMemoReq;

  const memo = await prisma.memo.findUnique({
    where: {
      id: body.id ?? -1,
    },
  });

  if(memo && (memo?.userId !== event.context.userId)){
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  if(process.env.ALIYUN_ACCESS_KEY_ID === undefined || process.env.ALIYUN_ACCESS_KEY_ID === '' || process.env.ALIYUN_ACCESS_KEY_ID === 'undefined' || process.env.ALIYUN_ACCESS_KEY_ID === 'null' ||
      process.env.ALIYUN_ACCESS_KEY_SECRET === undefined || process.env.ALIYUN_ACCESS_KEY_SECRET === '' || process.env.ALIYUN_ACCESS_KEY_SECRET === 'undefined' || process.env.ALIYUN_ACCESS_KEY_SECRET === 'null'){

  }else{
    const aliJudgeResponse1 = await aliTextJudge(body.content, 'comment_detection');
    if (aliJudgeResponse1.Data && aliJudgeResponse1.Data.labels && aliJudgeResponse1.Data.labels !== '') {
      let labelsList = aliJudgeResponse1.Data.labels.split(',');

      return {
        success: false,
        message: "内容不符合规范：" + labelsList.map((label: string) => staticWord[label]).join(', '),
      };
    }
  }

  const updated = {
    imgs: body.imgUrls?.join(","),
    music163Url: body.music163Url,
    bilibiliUrl: body.bilibiliUrl,
    location: body.location,
    externalUrl: body.externalUrl,
    externalTitle: body.externalTitle,
    externalFavicon: body.externalFavicon,
    content: body.content,
  };
  await prisma.memo.upsert({
    where: {
      id: body.id ?? -1,
    },
    create: {
      userId: event.context.userId,
      ...updated,
    },
    update: {
      ...updated,
    },
  });
  return {
    success: true,
  };
});
