import RPCClient from '@alicloud/pop-core';

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

// 阿里云文本审核
export async function aliTextJudge(content: string, Service: string = "comment_detection", aliyunAccessKeyId: string, aliyunAccessKeySecret: string) {
    // 注意，此处实例化的client请尽可能重复使用，避免重复建立连接，提升检测性能。
    let client = new RPCClient({
        /**
         * 阿里云账号AccessKey拥有所有API的访问权限，建议您使用RAM用户进行API访问或日常运维。
         * 强烈建议不要把AccessKey ID和AccessKey Secret保存到工程代码里，否则可能导致AccessKey泄露，威胁您账号下所有资源的安全。
         * 常见获取环境变量方式:
         */
        accessKeyId: aliyunAccessKeyId || 'default',
        accessKeySecret: aliyunAccessKeySecret || 'default',
        // 接入区域和地址请根据实际情况修改
        endpoint: "https://green-cip.cn-shanghai.aliyuncs.com",
        apiVersion: '2022-03-02',
        // 设置http代理
        // httpProxy: "http://xx.xx.xx.xx:xxxx",
        // 设置https代理
        // httpsProxy: "https://username:password@xxx.xxx.xxx.xxx:9999",
    });
    // 通过以下代码创建API请求并设置参数。
    const params = {
        // 文本检测service: 内容安全控制台文本增强版规则配置的serviceCode，示例: chat_detection
        "Service": Service,
        "ServiceParameters": JSON.stringify({
            //待检测文本内容。
            "content": content,
        }),
    };

    const requestOption = {
        method: 'POST',
        formatParams: false,
    };

    let response: any;
    try {
        response = await client.request('TextModeration', params, requestOption);
        if (response.Code === 500) {
            client.endpoint = "https://green-cip.cn-beijing.aliyuncs.com";
            response = await client.request('TextModeration', params, requestOption);
        }
    } catch (err) {
        console.log(err);
        return err;
    }
    return response;
}