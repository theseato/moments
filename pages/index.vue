<template>
  <div>

    <MemoInput v-if="token" @memo-added="firstLoad" />

    <div class="content flex flex-col divide-y divide-gray-100/50 gap-2">
      <div v-if="state.memoList.length === 0 && !token" class="text-center">
        <div class="my-2 text-sm">什么也没有,赶紧去登录发表Moments吧!</div>
        <Button @click="navigateTo('/login')">去登录</Button>
      </div>
      <FriendsMemo :memo="memo" v-for="(memo, index) in state.memoList" :key="index" :show-more="true"
                   @memo-update="firstLoad" />
    </div>

    <div id="get-more" ref="getMore" class="cursor-pointer text-center text-sm opacity-70 my-4" @click="loadMore()" v-if="state.hasNext" >
      点击加载更多...
    </div>
    <div class="cursor-pointer text-center text-sm opacity-70 my-4">
      ———— 没有更多啦～ ————
    </div>
  </div>
  <div id="version-info">
    当前版本: <span id="version">{{ version }}</span>
    <div class="update-details">
      更新日志:
      <br/>
      ·V0.1.0 2024-04-22 创建模板
      <br/>
      ·V0.1.1 2024-04-22 更新通知弹窗，添加动态加载
      <br/>
      ·V0.1.2 2024-04-23 支持markdown（不修改字体大小，也无列表等，保持朋友圈显示和谐）
      <br/>
      ·V0.2.0 2024-04-23 markdown功能完善，修复更新页面内容时markdown文本显示异常
      <br/>
      ·V0.2.1 2024-04-23 新增验证码功能
      <br/>
      ·V0.2.2 2024-04-24 新增访问速率限制，新增评论字数限制，将可变变量移动到.env文件
      <br/>
      ·V0.2.3 2024-04-24 新增邮件通知功能，所有被评论者（如果填写过邮箱）将会收到邮件通知
    </div>
    <div onclick="window.open('https://randallanjie.com/', '_blank');">Powered By Randall</div>
  </div>
</template>

<script setup lang="ts">
import { type User, type Memo } from '~/lib/types';
import { onMounted, onUnmounted, watch, ref } from 'vue';

const getMore = ref(null);
const token = useCookie('token')
const userinfo = useState<User>('userinfo')
const version = ref('');

let observer: IntersectionObserver | null = null;

function setLatestVersion() {
  const element = document.querySelector('.update-details');
  if (element) {
    const updatesText = element.innerText;
    const updates = updatesText.match(/V\d+\.\d+\.\d+/g); // 匹配所有版本号格式
    if (updates && updates.length) {
      version.value = updates.pop(); // 获取最后一个元素，即最新版本号
    }
  } else {
    console.warn('No update details found in the DOM.');
  }
}

onMounted(async () => {
  setLatestVersion();
  await firstLoad();
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMore();
    }
  }, {
    threshold: 0.1  // 当至少10%的元素可见时触发
  });

  if (getMore.value) {
    observer.observe(getMore.value);
  }

  // 当组件卸载时，停止观察
  onUnmounted(() => {
    if (getMore.value) {
      observer.unobserve(getMore.value);
    }
  });
  // 监听 getMore 引用的变化，并重新设置观察者
  watch(getMore, () => {
    setupObserver();
  }, {
    immediate: true // 立即触发，确保初始 setup
  });
});

const setupObserver = () => {
  // 清除现有的观察者（如果有）
  if (observer && getMore.value) {
    observer.unobserve(getMore.value);
  }

  // 创建新的观察者实例
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMore();
    }
  }, {
    threshold: 0.1 // 当至少10%的元素可见时触发
  });

  // 设置新的观察目标
  if (getMore.value) {
    observer.observe(getMore.value);
  }
};


useHead({
  title: userinfo.value.title || 'Randall的小屋',
})


const state = reactive({
  memoList: Array<Memo>(),
  page: 1,
  hasNext: false
})


const firstLoad = async () => {
  state.page = 1
  const { data, hasNext } = await $fetch('/api/memo/list', {
    key: 'memoList',
    method: 'POST',
    body: JSON.stringify({
      page: state.page,
    })
  })
  state.memoList = data as any as Memo[]
  state.hasNext = hasNext || false
  // await loadMore()
}


const loadMore = async () => {
  try {
    const { data, hasNext } = await $fetch('/api/memo/list', {
      key: 'memoList',
      method: 'POST',
      body: JSON.stringify({
        page: state.page + 1, // 先不增加页码
      })
    });
    state.page += 1;
    state.memoList.push(...data as any as Memo[]);
    state.hasNext = hasNext;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      rStatusMessage.warning('请求过于频繁，请稍后再试');
    } else {
      // 处理其他错误
      console.error('Failed to load more memos:', error);
    }
  }
}




</script>

<style scoped></style>
<style>
#version-info {
  text-align: left;
  position: fixed;
  left: 10px;
  bottom: 10px;
  margin: 20px;
  padding: 0;
  border-radius: 5px;
  font-size: 12px;
  color: rgba(128, 128, 128, 0.7);
  z-index: 9999;
  transition: all 0.3s ease;
  overflow: hidden;
  max-height: 20px;
}

#version-info:hover {
  color: white;
  background-color: rgba(128, 128, 128, 0.7);
  max-height: 100%;
}

.update-details {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

#version-info:hover .update-details {
  opacity: 1;
  max-height: 100%;
}
</style>