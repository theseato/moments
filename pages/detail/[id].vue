<template>
  <div>
    <div class="p-2 sm:p-4">
      <FriendsMemo :memo="data?.data as any as Memo" v-if="data?.data" :show-more="false" @memo-update="refresh" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Memo } from '~/lib/types';


useHead({

})
const route = useRoute()
const id = route.params.id

const {data,refresh} = await useFetch('/api/memo/detail', {
  key:`memoDetail-${id}`,
  method: 'POST',
  body: JSON.stringify({ id: parseInt(id as string) })
})


</script>

<style scoped></style>