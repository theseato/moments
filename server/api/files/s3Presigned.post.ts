import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dayjs from "dayjs";
import prisma from "~/lib/db";
import short from "short-uuid";
import * as Minio from "minio";


export default defineEventHandler(async (event) => {
  const { fileType } = (await readBody(event)) as { fileType: string };


  const siteConfig = await prisma.config.findUnique({
    where: {
      id: 1,
    },
  });

  if (
    !fileType ||
    !siteConfig ||
    !siteConfig.enableS3 ||
    !siteConfig.s3AccessKey ||
    !siteConfig.s3SecretKey ||
    !siteConfig.s3Bucket ||
    !siteConfig.s3Region ||
    !siteConfig.s3Endpoint
  ) {
    return {
      success: false,
      message: "S3 not enabled",
      url: "",
      imgUrl: "",
    };
  }

  if(siteConfig.s3Domain == 'minio'){

    const endPoint = siteConfig.s3Endpoint.split(":")[0].replace("//", "");
    const port = parseInt(siteConfig.s3Endpoint.split(":")[-1]);
    const useSSL = siteConfig.s3Endpoint.startsWith("https");

    const minioClient = new Minio.Client({
      endPoint: endPoint,
      port: port,
      useSSL: useSSL,
      accessKey: siteConfig.s3AccessKey,
      secretKey: siteConfig.s3SecretKey,
    });

    const key =
        "moments/" + dayjs(new Date()).format("YYYY/MM/DD/") + short.generate();
    const url = await minioClient.presignedPutObject(siteConfig.s3Bucket, key, 600);
    let imgUrl = `${siteConfig.s3Endpoint}/${key}`;
    return {
      success: true,
      url,
      imgUrl,
      message: "",
    };


  }else{
    const client = new S3Client({
      region: siteConfig.s3Region,
      endpoint: siteConfig.s3Endpoint,
      credentials: {
        accessKeyId: siteConfig.s3AccessKey,
        secretAccessKey: siteConfig.s3SecretKey,
      },
    });

    const key =
        "moments/" + dayjs(new Date()).format("YYYY/MM/DD/") + short.generate();
    const command = new PutObjectCommand({
      Bucket: siteConfig.s3Bucket,
      Key: key,
      ContentType: fileType,
    });
    const url = await getSignedUrl(client, command, { expiresIn: 600 });
    let imgUrl = `${siteConfig.s3Domain}/${key}`;
    return {
      success: true,
      url,
      imgUrl,
      message: "",
    };
  }

});
