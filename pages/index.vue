<template>
  <div>

    <MemoInput v-if="token" @memo-added="refresh" />

    <div class="content flex flex-col divide-y divide-gray-100/50 gap-2">
      <div v-if="(data?.data as any as Memo[]).length === 0 && !token" class="text-center">
        <div class="my-2 text-sm">什么也没有,赶紧去登录发表Moments吧!</div>
        <Button @click="navigateTo('/login')">去登录</Button>
      </div>
      <FriendsMemo :memo="memo" v-for="(memo, index) in data?.data as any as Memo[]" :key="index" :show-more="true"
        @memo-update="refresh" />

    </div>
    <div id="get-more" ref="getMore" class="cursor-pointer text-center text-sm opacity-70 my-4" @click="loadMore()" v-if="state.hasNext">
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
      ·V0.1 2024-04-22 创建模板
      <br/>
      ·V0.1.1 2024-04-22 更新通知弹窗，添加动态加载
    </div>
    <div onclick="window.open('https://randallanjie.com/', '_blank');">Powered By Randall</div>
  </div>
</template>

<script setup lang="ts">
import { type User, type Memo } from '~/lib/types';
import { onMounted, onUnmounted, ref } from 'vue';

const getMore = ref(null);
const token = useCookie('token')
const userinfo = useState<User>('userinfo')
const version = '0.1.1'


onMounted(() => {
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
});


useHead({
  title: userinfo.value.title || 'Randall的小屋',
})


const state = reactive({
  memoList: Array<Memo>(),
  page: 1,
  hasNext: false
})


const { data, refresh } = await useFetch('/api/memo/list', {
  key: 'memoList',
  method: 'POST',
  body: JSON.stringify({
    page: state.page,
  })
})
state.memoList = data.value?.data as any as Memo[]
state.hasNext = data.value?.hasNext || false

const loadMore = async () => {
  const { data, hasNext } = await $fetch('/api/memo/list', {
    key: 'memoList',
    method: 'POST',
    body: JSON.stringify({
      page: ++state.page,
    })
  })
  state.memoList.push(...data as any as Memo[])
  state.hasNext = hasNext
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