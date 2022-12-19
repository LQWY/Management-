<template>
  <div>
    <!-- inline代表的是行内表单 -->
    <el-form :inline="true" class="demo-form-inline" :model="categoryForm">
      <el-form-item label="一级分类">
        <el-select
          placeholder="请选择"
          v-model="categoryForm.category1Id"
          @change="handler1"
          :disabled="show"
        >
          <el-option
            :label="c1.name"
            :value="c1.id"
            v-for="c1 in list1"
            :key="c1.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select
          placeholder="请选择"
          v-model="categoryForm.category2Id"
          @change="handler2"
          :disabled="show"
        >
          <el-option
            :label="c2.name"
            :value="c2.id"
            v-for="c2 in list2"
            :key="c2.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select
          placeholder="请选择"
          v-model="categoryForm.category3Id"
          @change="handler3"
          :disabled="show"
        >
          <el-option
            :label="c3.name"
            :value="c3.id"
            v-for="c3 in list3"
            :key="c3.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "CategorySelect",
  data() {
    return {
      // 一级分类的数据
      list1: [],
      // 二级分类的数据
      list2: [],
      // 三级分类的数据
      list3: [],
      // 收集一二三级分类的id
      categoryForm: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
    };
  },
  // 接收父组件传来的值，show=false
  props: ["show"],
  // 组件挂载完毕向服务器发请求，获取一级分类的数据
  mounted() {
    this.getCategoryList1();
  },
  methods: {
    async getCategoryList1() {
      let result = await this.$API.attr.reqCategoryList1();
      if (result.code == 200) {
        // 只要前16个数据
        let arr = result.data.slice(0, 16);
        this.list1 = arr;
      }
    },

    // 一级分类select的事件回调（当一级分类的option变化的时候获取对应二级分类的数据）
    async handler1() {
      // 清空后面二三级分类的数据
      this.list2 = [];
      this.list3 = [];
      this.categoryForm.category2Id = "";
      this.categoryForm.category3Id = "";
      // 解构处一级分类的id
      const { category1Id } = this.categoryForm;
      // 触发自定义事件并传递1id
      this.$emit("getCategoryId", { categoryId: category1Id, level: 1 });
      // 通过一级分类的id获取对应二级分类的数据
      let result = await this.$API.attr.reqCategoryList2(category1Id);
      if (result.code == 200) {
        this.list2 = result.data;
      }
    },

    // 二级分类select的事件回调（当二级分类的option变化的时候获取对应三级分类的数据）
    async handler2() {
      // 清空三级分类的数据
      this.list3 = [];
      this.categoryForm.category3Id = "";
      // 解构处二级分类的id
      const { category2Id } = this.categoryForm;
      // 触发自定义事件并传递2id
      this.$emit("getCategoryId", { categoryId: category2Id, level: 2 });
      // 通过一级分类的id获取对应二级分类的数据
      let result = await this.$API.attr.reqCategoryList3(category2Id);
      if (result.code == 200) {
        this.list3 = result.data;
      }
    },
    // 三级分类select的事件回调（当二级分类的option变化的时候获取对应三级分类的数据）
    handler3() {
      // 解构出三级分类的id
      const { category3Id } = this.categoryForm;
      // 触发自定义事件并传递3id
      this.$emit("getCategoryId", { categoryId: category3Id, level: 3 });
    },
  },
};
</script>

<style>
</style>