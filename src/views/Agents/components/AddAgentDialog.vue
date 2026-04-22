<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAgentStore } from '@/store/modules/agents'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const agentStore = useAgentStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  name: '',
  contactPerson: '',
  contactPhone: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '請輸入代理商名稱', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '請輸入聯絡人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '請輸入聯絡電話', trigger: 'blur' },
    {
      pattern: /^[0-9+\-\s()]{7,20}$/,
      message: '請輸入有效的聯絡電話',
      trigger: 'blur'
    }
  ]
}

const handleConfirm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await agentStore.createAgent({ ...form })
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
    title="新增代理商"
    width="480px"
    @update:model-value="(val) => emit('update:visible', val)"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="right">
      <ElFormItem label="代理商名稱" prop="name">
        <ElInput v-model="form.name" placeholder="請輸入代理商名稱" />
      </ElFormItem>
      <ElFormItem label="聯絡人" prop="contactPerson">
        <ElInput v-model="form.contactPerson" placeholder="請輸入聯絡人" />
      </ElFormItem>
      <ElFormItem label="聯絡電話" prop="contactPhone">
        <ElInput v-model="form.contactPhone" placeholder="請輸入聯絡電話" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleCancel">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleConfirm">確認</ElButton>
    </template>
  </ElDialog>
</template>
