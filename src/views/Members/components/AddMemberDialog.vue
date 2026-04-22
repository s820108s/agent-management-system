<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useMemberStore } from '@/store/modules/members'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const memberStore = useMemberStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  agentId: '' as string | number | ''
})

const rules: FormRules = {
  username: [{ required: true, message: '請輸入使用者名稱', trigger: 'blur' }],
  email: [
    { required: true, message: '請輸入 Email', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的 Email 格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 8, message: '密碼至少需要 8 個字元', trigger: 'blur' }
  ],
  agentId: [{ required: true, message: '請選擇所屬代理商', trigger: 'change' }]
}

const noAgents = computed(
  () => !memberStore.agentOptionsLoading && memberStore.agentOptions.length === 0
)

const handleOpen = () => {
  memberStore.fetchAgentOptions()
}

const handleConfirm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await memberStore.createMember({
      username: form.username,
      email: form.email,
      password: form.password,
      agentId: form.agentId as string | number
    })
    emit('update:visible', false)
    emit('success')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}

const handleClosed = () => {
  formRef.value?.resetFields()
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    title="新增會員"
    width="500px"
    @update:model-value="(val) => emit('update:visible', val)"
    @open="handleOpen"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="110px" label-position="right">
      <ElFormItem label="使用者名稱" prop="username">
        <ElInput v-model="form.username" placeholder="請輸入使用者名稱" />
      </ElFormItem>
      <ElFormItem label="Email" prop="email">
        <ElInput v-model="form.email" placeholder="請輸入 Email" />
      </ElFormItem>
      <ElFormItem label="密碼" prop="password">
        <ElInput
          v-model="form.password"
          type="password"
          placeholder="請輸入密碼（至少 8 個字元）"
          show-password
        />
      </ElFormItem>
      <ElFormItem label="所屬代理商" prop="agentId">
        <ElSelect
          v-model="form.agentId"
          placeholder="請選擇代理商"
          :loading="memberStore.agentOptionsLoading"
          style="width: 100%"
        >
          <template v-if="noAgents" #empty>
            <span class="el-select-dropdown__empty">暫無可用代理商</span>
          </template>
          <ElOption
            v-for="agent in memberStore.agentOptions"
            :key="agent.id"
            :label="agent.name"
            :value="agent.id"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleCancel">取消</ElButton>
      <ElButton type="primary" :loading="submitting" :disabled="noAgents" @click="handleConfirm">
        確認
      </ElButton>
    </template>
  </ElDialog>
</template>
