import fs from "fs/promises";
import short from "short-uuid";
import { exec } from 'child_process';
type FileInfo = { name: string; filename: string; data: Buffer; type: string };

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData) {
    return {
      success: false,
      message: "No file found",
      filename: "",
    };
  }
  const file = formData[0] as FileInfo;
  if (!file.type.startsWith("image")) {
    return {
      success: false,
      message: "只支持上传图片文件",
      filename: "",
    };
  }
  let filetype = file.type.split("/")[1];

  let filename = short.generate();
  
  const filepath = `${process.env.UPLOAD_DIR}/${filename}.${filetype}`;
  try{
    await fs.writeFile(filepath, file.data);
  }catch(e){
    console.log('filepath is : ',filepath)
    console.log('writeFile error is : ',e)
  }

    if (filetype == "heif" || filetype == "heic") {
        filetype = "jpg";
        exec(`heif-convert ${filepath} ${process.env.UPLOAD_DIR}/${filename}.jpg`, (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
        });
    }

    console.log('filetype is : ',filetype)

  return {
    success: true,
    filename: "/upload/" + filename + "." + filetype,
    message: "上传文件成功!",
  };
});
