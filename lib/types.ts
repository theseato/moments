export type Memo = {
  id: number;
  content: string;
  imgs: string;
  favCount: number;
  commentCount: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  music163Url?: string;
  bilibiliUrl?: string;
  location?: string;
  externalUrl?: string;
  externalTitle?: string;
  externalFavicon?: string;
  comments: Array<Comment>;
  hasMoreComments:boolean;
  pinned:boolean,
  _count: {
    comments: number;
  };
};


export type Comment = {
  id: number;
  content: string;
  replyTo: string;
  username: any;
  email: any;
  website: any;
  createdAt: string;
  updatedAt: string;
  memoId: number;
  author?:Boolean
}

export type User = {
  username: string;
  nickname: string;
  slogan: string;
  id: number;
  avatarUrl: string;
  coverUrl: string;
  favicon:string;
  title:string;
  css:string;
  js:string;
  beianNo:string;
}

export type config = {
  id: number;
  enableS3: boolean;
  s3Domain: string;
    s3Bucket: string;
    s3Region: string;
    s3AccessKey: string;
    s3SecretKey: string;
    s3Endpoint: string;
    s3ThumbnailSuffix: string;
    favicon: string;
    title: string;
    css: string;
    js: string;
    beianNo: string;
}