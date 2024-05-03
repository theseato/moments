import { useStorage } from "@vueuse/core";
import { toast } from "vue-sonner";

export type UploadCallBack = (res: {
  success: boolean;
  message: string;
  filename: string;
}) => void;

export const useUpload = async (file: File, cb: UploadCallBack) => {

  if(!file.type.startsWith("image")){
    toast.error("只支持上传图片文件");
    return
  }

  const siteConfig = await $fetch("/api/site/config/get");
  if (!siteConfig.success) {
    toast.error("获取配置失败");
    return;
  }
  console.log(siteConfig);
  if (siteConfig.data.enableS3) {
    const res = await $fetch("/api/files/s3Presigned", {
      method: "POST",
      body: JSON.stringify({
        fileType: file.type,
      }),
    });
    if (res.success) {
      $fetch(res.url, {
        method: "PUT",
        body: file,
        // @ts-ignore
        headers: {
          "Content-Type": null,
        },
      })
        .then(() => {
          cb({
            success: true,
            message: "",
            filename: res.imgUrl,
          });
        })
        .catch((e) => {
          cb({
            success: false,
            message: e.message,
            filename: "",
          });
        });
    }
  } else {
    const formData = new FormData();
    formData.append("file", file);
    const res = await $fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });
    cb(res);
  }
};
