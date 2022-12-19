<template>
  <div>
    <el-card>
      <!-- 三级导航已经是全局组件，可以直接使用 -->
      <!-- 三级导航用了disabled来控制，所以要取反 -->
      <CategorySelect
        @getCategoryId="getCategoryId"
        :show="scene != 0"
      ></CategorySelect
    ></el-card>
    <el-card style="margin: 20px 0">
      <!-- 展示spu列表的结构 -->
      <div v-show="scene == 0">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="addSpu"
          >添加SPU</el-button
        >
        <!-- 表格 -->
        <el-table border :data="records">
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="spuName" label="spu名称" width="width">
          </el-table-column>
          <el-table-column prop="description" label="spu描述" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <!-- 操作按钮 -->
            <template v-slot="{ row }">
              <!-- 添加按钮 -->
              <el-button
                type="success"
                icon="el-icon-plus"
                size="mini"
                title="添加sku"
                @click="addSku(row)"
              ></el-button>
              <!-- 编辑按钮 -->
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改spu"
                @click="updateSpu(row)"
              ></el-button>
              <!-- 信息按钮 -->
              <el-button
                type="info"
                icon="el-icon-info"
                size="mini"
                title="查看当前spu的全部sku列表"
                @click="handeler(row)"
              ></el-button>
              <!-- 删除按钮--注意版本问题，以前的是onConfirm -->
              <el-popconfirm
                title="确定删除当前SPU吗？"
                @onConfirm="deleteSpu(row)"
              >
                <el-button
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  title="删除spu"
                ></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          v-show="total"
          style="margin-top: 20px; text-align: center"
          :current-page="page"
          :page-size="limit"
          :total="total"
          :page-sizes="[3, 5, 10]"
          layout=" prev, pager, next, jumper,->,sizes,total "
          @size-change="handelSizeChange"
          @current-change="handleCurrentChange"
        >
        </el-pagination>
      </div>

      <!-- 展示添加|修改SPU的结构 -->
      <SpuForm
        v-show="scene == 1"
        @changeScene="changeScene"
        ref="SpuForm"
      ></SpuForm>
      <!-- 展示添加SKU的结构 -->
      <SkuForm
        v-show="scene == 2"
        @changeScene2="changeScene2"
        ref="SkuForm"
      ></SkuForm>
    </el-card>
    <!-- info按钮的对话框 -->
    <el-dialog
      :title="spu.spuName"
      :visible.sync="dialogTableVisible"
      :before-close="dialogClose"
    >
      <!-- table展示SKU列表 -->
      <el-table :data="skuList" v-loading="loading">
        <el-table-column
          prop="skuName"
          label="名称"
          width="width"
        ></el-table-column>
        <el-table-column
          prop="price"
          label="价格"
          width="width"
        ></el-table-column>
        <el-table-column
          prop="weight"
          label="重量"
          width="width"
        ></el-table-column>
        <el-table-column label="默认图片" width="width">
          <template v-slot="{ row }">
            <img :src="row.skuDefaultImg" style="width: 100px; height: 100px" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SkuForm from "./SkuForm";
import SpuForm from "./SpuForm";
export default {
  name: "Spu",
  data() {
    return {
      //切换展示模块,0代表spu列表，1代表添加修改spu，2代表添加sku
      // 切换三级导航禁用，!0可用，0禁用,因为是disabled，需要取反
      scene: 0,
      // 获取导航每级分类的id
      category1Id: "",
      category2Id: "",
      category3Id: "",
      // 初始化分页器数据
      page: 1,
      limit: 3,
      total: 0,
      // 存储spu列表的数据
      records: [],
      // 对话框可见性
      dialogTableVisible: false,
      // 存储数据
      spu: {}, //info按钮row的数据
      skuList: [], //sku列表的数据
      // loading效果展示
      loading: true,
    };
  },
  components: { SkuForm, SpuForm },
  methods: {
    // 三级导航的自定义事件。获取子组件（category）的数据（id）
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
        // 发请求获得平spu的数据展示在页面
        this.getSpuList();
      }
    },

    // 获取spu展示数据
    async getSpuList() {
      const { page, limit, category3Id } = this;
      let result = await this.$API.spu.reqSpuList(page, limit, category3Id);
      if (result.code == 200) {
        this.records = result.data.records;
        this.total = result.data.total;
      }
    },

    // 分页器-----改变当前页
    handleCurrentChange(page) {
      this.page = page;
      this.getSpuList();
    },
    // 分页器----改变页面展示数据条数
    handelSizeChange(size) {
      this.limit = size;
      this.getSpuList();
    },

    // 添加spu
    addSpu() {
      // 切换展示添加spu模块
      this.scene = 1;
      // 调用子组件的方法
      this.$refs.SpuForm.addSpuData(this.category3Id);
    },

    // 修改sku按钮的回调
    addSku(row) {
      // 切换展示添加sku模块
      this.scene = 2;
      // 父组件调用子组件的方法----让子组件发请求
      this.$refs.SkuForm.getData(this.category1Id, this.category2Id, row);
    },
    // 修改spu按钮的回调
    updateSpu(row) {
      // 切换展示添加|修改模块
      this.scene = 1;
      // 调用子组件SpuForm的方法获取数据
      this.$refs.SpuForm.initSpuForm(row);
    },
    // 信息按钮的回调----查看展示skuList的对话框
    async handeler(spu) {
      // spu就是row传来的数据
      // 展示对话框
      this.dialogTableVisible = true;
      // 存储row（spu)传来的数据
      this.spu = spu;
      // 发请求获取skuList的数据
      let result = await this.$API.spu.reqSkuList(spu.id);
      if (result.code == 200) {
        this.skuList = result.data;
        // 加载完毕关闭loading效果
        this.loading = false;
      }
    },
    // 删除spu按钮的回调
    async deleteSpu(row) {
      // console.log(row);  //测试看数据
      let result = await this.$API.spu.reqDeleteSpu(row.id);
      // console.log(result);   //测试看数据
      if (result.code == 200) {
        // 提示信息
        this.$message({ type: "success", message: "删除成功" });
        // 删除完之后发请求获得最新数据
        // 当前页还有数据停留在当前页，当前页数据空去上一页
        let page = this.records.length > 1 ? this.page : this.page - 1;
        this.handleCurrentChange(page);
      }
    },

    // 关闭对话框
    dialogClose(done) {
      // loading再次变为true
      this.loading = true;
      // 清空数据
      this.skuList = [];
      // 关闭对话框
      done();
    },

    // SpuForm的自定义事件回调,自定义事件回调一定是需要传参的，就是通过传参获得子组件的数据
    changeScene({ scene, flag }) {
      // 切换场景
      this.scene = scene;
      if (flag == "修改") {
        // 如果修改回到当前页码
        // 子组件通知父组件切换场景,需要再次发请求获取数据来展示当前页
        this.handleCurrentChange(this.page);
        // 切换分页会发请求
      } else {
        // 如果是添加回到首页
        this.handleCurrentChange(1);
      }
    },
    // SpuForm的自定义事件回调,切换场景，不用请求数据
    changeScene2(scene) {
      this.scene = scene;
    },
  },
};
</script>

<style>
</style>
vu