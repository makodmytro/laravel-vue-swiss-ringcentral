<script setup>
import { SDK } from "@ringcentral/sdk"

onBeforeMount(() => {
  SDK.handleLoginRedirect()
})
</script>

<template/>

