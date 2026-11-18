<template>
  <TheHeader />
  <section class='admin'>
    <div class='container'>
      <h1 class="title">Admin panel</h1>
      <div class='admin__inner'>
        <div class="admin__item">
          <h2>Добавить новую технологию</h2>
          <input v-model="toolName" type="text" placeholder="Название технологии">
          <select v-model="categoryId" name="category" id="category">
            <option v-for="c of categories" :key="c" :value="c">{{ c.nameCategory }}</option>
          </select>

          <button @click="addTool">Добавить</button>
        </div>
        <div class="admin__item">
          <h2>Добавить новую категорию</h2>
          <input v-model="categoryName" type="text" placeholder="Название категории">
          <button @click="addCategory">Добавить</button>
        </div>
      </div>
    </div>
  </section>

</template>
<script>
import { useUser } from 'vue-clerk'
import api from '../features/ToolsList/api';


export default {

  data() {
    return {
      categories: [],
      categoryName: '',
      categoryId: 'React',
      toolName: '',
    }
  },


  async mounted() {
    if (!useUser().isSignedIn.value) {
      this.$router.push('/')
    }
    this.categories = await api.getCategories()
  },


  methods: {
    addCategory() {
      api.addCategory(this.categoryName)
      this.categoryName = ''
    },

    addTool() {
      api.addTool(this.toolName, this.categoryId.idCategory)
      this.toolName = ''
      this.categoryId = ''
    }
  }
}
</script>

<style scoped>
.admin__item {
  margin-bottom: calc(var(--unit) * 5);
}

h2 {
  margin-bottom: 10px;
}

button {
  padding: 5px 10px;
  margin-left: 10px;
  border: 1px solid var(--color-text);
  border-radius: 5px;
}

select {
  margin: 0 10px;
}
</style>
