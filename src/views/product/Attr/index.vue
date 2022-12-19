<template>
  <div>
    <el-card>
      <CategorySelect
        @getCategoryId="getCategoryId"
        :show="!isShowTable"
      ></CategorySelect>
    </el-card>
    <el-card style="margin: 20px 0">
      <!-- 平台属性的展示（table） -->
      <div v-show="isShowTable">
        <el-button
          type="primary"
          icon="el-icon-puls"
          :disabled="!category3Id"
          @click="addAttr"
          >添加属性</el-button
        >
        <!-- 表格：展示平台属性 -->
        <el-table border :data="attrList">
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150">
          </el-table-column>
          <el-table-column prop="prop" label="属性值列表" width="width">
            <template v-slot="{ row }">
              <el-tag
                type="success"
                v-for="attrValue in row.attrValueList"
                :key="attrValue.id"
                style="margin: 0 10px"
                >{{ attrValue.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150" align="center">
            <template v-slot="{ row }">
              <!-- 修改和删除按钮 -->
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-edit"
                @click="updateAttr(row)"
              ></el-button>
              <el-button
                type="delete"
                size="mini"
                icon="el-icon-delete"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加|修改属性的结构 -->
      <div v-show="!isShowTable">
        <el-form
          label-width="80px"
          :inline="true"
          size="normal"
          :model="attrInfo"
        >
          <el-form-item label="属性名">
            <el-input
              placeholder="请输入属性名"
              v-model="attrInfo.attrName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="!attrInfo.attrName"
          >添加属性值</el-button
        >
        <el-button @click="isShowTable = true">取消</el-button>
        <el-table border style="margin: 20px 0" :data="attrInfo.attrValueList">
          <el-table-column
            type="index"
            prop="prop"
            label="序号"
            width="80"
            align="center"
          >
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称">
            <template v-slot="{ row, $index }">
              <!-- 切换查看和编辑模式需要input和span切换 -->
              <el-input
                v-if="row.flag"
                :ref="$index"
                @blur="toLook(row)"
                @keyup.native.enter="toLook(row)"
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                size="mini"
              ></el-input>
              <span
                v-else
                @click="toEdit(row, $index)"
                style="display: block"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作">
            <template v-slot="{ row, $index }">
              <!-- 气泡弹出框 -->
              <el-popconfirm
                :title="`确定删除${row.valueName}吗？}`"
                @onConfirm="deleteAttrValue($index)"
              >
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  slot="reference"
                ></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          @click="saveAttr"
          :disabled="attrInfo.attrValueList.length < 1"
          >保存</el-button
        >
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
// 按需引入lodash中的深拷贝
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      // 接收子组件category传来的id
      category1Id: "",
      category2Id: "",
      category3Id: "",
      // 接收服务器传来的平台属性的数据
      attrList: [],
      // table组件是否展示|切换三级导航禁用
      isShowTable: true,
      // 收集属性：添加|修改
      attrInfo: {
        attrName: "", // 属性名
        attrValueList: [],
        // 属性值，可能有多个属性值，所以用数组
        // 原来在attrValueList中的数据，只是占个位，现在需要点击添加后自动生成
        /*  
        {
          attrId: 0,
        //id: 0,         // 添加属性不需要id，因为服务器数据库会自动生成
          valueName: "",
        }, */
        categoryId: 0, //需要三级分类的id
        categoryLevel: 3, //服务器也需要区分是几级id
        // id: 0,            // 同理
      },
    };
  },
  methods: {
    // 三级联动自定义事件的回调,获得子组件的数据
    getCategoryId({ categoryId, level }) {
      // 根据level区分三级分类的id，并将回调传来的参数存储在父组件中
      if (level == 1) {
        this.category1Id = categoryId;
        // 每次一级分类变化就要清空后面分类的数据
        this.category2Id = "";
        this.category3Id = "";
      } else if (level == 2) {
        this.category2Id = categoryId;
        // 清空后面分类数据
        this.category3Id = "";
      } else {
        // 代表三级分类的id已经有了
        this.category3Id = categoryId;
        // 需要发请求获得平台属性的数据展示在页面
        this.getAttrList();
      }
    },

    // 获取平台属性的数据
    // 当用户确定三级分类的时候，向服务器发请求获取平台属性的收据在页面进行展示
    async getAttrList() {
      const { category1Id, category2Id, category3Id } = this;
      let result = await this.$API.attr.reqAttrList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code == 200) {
        // 接收服务器传来的数据存储在data中
        this.attrList = result.data;
      }
    },

    // 添加属性
    addAttr() {
      // 切换平台属性table的显示
      this.isShowTable = false;
      // 清空填写的属性数据
      this.attrInfo = {
        attrName: "", // 属性名
        attrValueList: [],
        categoryId: this.category3Id, //需要三级分类的id
        categoryLevel: 3, //服务器也需要区分是几级id
      };
    },

    // 添加属性值
    addAttrValue() {
      // 向属性值的数组添加元素
      // attrId：对应的属性的id，目前只是添加属性的操作，还没有对应的id，所以用undefined
      // valueName：对应的属性值名称
      this.attrInfo.attrValueList.push({
        attrId: this.attrInfo.id, //修改属性的时候可以在已有属性的基础上新增属性值（新增属性值的时候需要把已有的id带上）
        valueName: "",
        // 切换查看(span)和编辑(input)
        flag: true,
        // 给每一个属性值都添加flag属性，这样可以让每个属性值控制自己的查看还是编辑
      });
      this.$nextTick(() => {
        this.$refs[this.attrInfo.attrValueList.length - 1].focus();
      });
    },

    // 修改某一个属性
    updateAttr(row) {
      // 切换平台属性tabel的显示
      this.isShowTable = false;
      // 将选中的属性赋值给attrInfo
      // this.attrInfo = row; //这是浅拷贝，只是指向了地址，两者指向同一个对象，所以点击取消之后数据还是在页面展示（因为v-model数据双向绑定）
      // this.attrInfo = {...row} //由于数据结构中存在数组里面套着对象，{...row}只能深拷贝第一层。所以这里需要用深拷贝来解决问题
      this.attrInfo = cloneDeep(row);
      this.attrInfo.attrValueList.forEach((item) => {
        // 这样书写不是响应式的数据，vue检测不到，页面就不会响应
        // item.flag = false;
        this.$set(item, "flag", false);
        // $set(target,  propertyName/index", value)
      });
    },

    // 编辑模式----点击span的回调
    toEdit(row, index) {
      //切换为编辑模式（显示input，隐藏span）
      row.flag = true;

      // 获取input节点，实现自动聚焦
      // console.log(this.$refs[index]);
      // 这样是获取不到的，点击span的时候input还渲染没出来（v-if渲染树上都没有），可以使用$nextTick解决
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },

    // 查看模式----失去input焦点的回调
    toLook(row) {
      // row是当前用户添加的最新属性值
      // 判断：属性值不能为空（给用户提示需要输入其他属性值）
      if (row.valueName.trim() == "") {
        this.$message.error("输入不能为空！");
        return; // 为空，退出函数
      }
      // 新增的属性值不能与已有的重复
      let isRepeat = this.attrInfo.attrValueList.some((item) => {
        // some返回布尔值
        // row是最新添加的一项
        // item最后一项就是row，不能自己和自己比较
        if (row !== item) {
          return row.valueName == item.valueName;
          // 判断输入是否重复（==是相等判断，不是赋值）
        }
      });
      if (isRepeat) {
        this.$message.error("输入不能重复！");
        return;
      }
      row.flag = false; // 切换为查看模式（显示span，隐藏input）
    },

    // 气泡弹出框----确定按钮
    deleteAttrValue(index) {
      // 当前删除操作不用发请求
      this.attrInfo.attrValueList.splice(index, 1);
    },

    // 保存按钮-----向服务器请求添加或修改属性
    async saveAttr() {
      // 整理收集到的参数
      // 1.空属性不能提交
      // 2.flag值不应该提交给服务器
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(
        (item) => {
          // fliter返回满足条件的新数组，没有复杂逻辑一般可以直接return
          if (item.valueName != "") {
            delete item.flag;
            // 这里需要（return）返回if筛选出来的item
            return true;
          }
        }
      );
      // 发请求
      try {
        await this.$API.attr.reqSaveAttr(this.attrInfo);
        // 切换为平台展示
        this.isShowTable = true;
        this.$message({
          message: "保存成功！",
          type: "success",
        });
        // 保存成功之后需要获取最新平台属性进行展示
        this.getAttrList();
      } catch (error) {
        this.$message(error.message);
      }
    },
  },
};
</script>

<style>
</style>
