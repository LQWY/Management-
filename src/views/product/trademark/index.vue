<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="addTradeMark"
      >添加</el-button
    >
    <!-- 表格 -->
    <el-table border :data="list">
      <!-- 
        lable是显示的标题
        prop:对应列内容的字段名
        el-table组件展示的数据是一列一列的
      -->
      <el-table-column
        type="index"
        prop="prop"
        label="序号"
        width="80px"
        align="center"
      >
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column prop="prop" label="品牌LOGO  " width="width">
        <template v-slot="{ row }">
          <img :src="row.logoUrl" alt="" style="width: 100px; height: 100px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template v-slot="{ row }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="updataTradeMark(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTradeMark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器
      layout分页器布局，其中->,最右侧排列
      pager-count：一共显示几个按钮
    -->
    <el-pagination
      v-show="total"
      style="margin-top: 20px; text-align: center"
      :current-page="page"
      :page-size="limit"
      :total="total"
      :page-sizes="[3, 5, 10]"
      layout=" prev, pager, next, jumper,->,sizes,total "
      @size-change="handelSizeChange"
      @current-change="getPageList"
    >
    </el-pagination>

    <!-- 对话框 
      :visible.sync控制对话框的显示和隐藏
    -->
    <el-dialog
      :title="tmform.id ? '修改品牌' : '添加品牌'"
      :visible.sync="dialogFormVisible"
    >
      <!-- 
        from表单 :model属性，把表单数据收集到一个对象上，验证表单的时候也需要这个属性
        Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可
      -->
      <el-form style="width: 80%" :model="tmform" :rules="rules" ref="ruleForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input autocomplete="off" v-model="tmform.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <!-- 上传图片
            action：设置图片上传地址
            :on-success检测图片上传成功，成功会执行一次
            :betore-upload:可以在上传图片之前，会执行一次
          -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmform.logoUrl" :src="tmform.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "tradeMark",
  data() {
    // 自定义校验规则
    var validateTmName = (rule, value, callback) => {
      if (value.length < 2 || value.length > 10) {
        callback(new Error("长度为2~10个字符"));
      } else {
        callback();
      }
    };
    return {
      // 初始化分页器数据：page（当前页）和limit（展示数据条数）
      page: 1,
      limit: 3,
      total: 0,
      // 列表展示数据
      list: [],
      // 控制对话框显示与隐藏的属性
      dialogFormVisible: false,
      // 收集品牌信息，对象身上的属性不能乱写，需要看接口文档
      tmform: {
        tmName: "",
        logoUrl: "",
      },
      // 表单验证的规则
      rules: {
        // 品牌名称的验证规则
        tmName: [
          // required必须要校验的字段，会带*  message提示信息  trigger用户行为（事件blur|change）
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          // 自定义校验规则
          { validator: validateTmName, trigger: "change" },
          /* 原来的校验规则
            {
              min: 2,
              max: 10,
              message: "长度在 2 到 10 个字符",
              trigger: "change",
            },
          */
        ],
        // 品牌logo的验证规则
        logoUrl: [{ required: true, message: "请上传品牌logo" }],
      },
    };
  },
  mounted() {
    this.getPageList();
  },
  methods: {
    // 获取品牌列表数据
    async getPageList(pager = 1) {
      this.page = pager;
      const { page, limit } = this;
      let result = await this.$API.trademark.reqTradeMarkList(page, limit);
      if (result.code == 200) {
        this.total = result.data.total;
        this.list = result.data.records;
      }
    },

    /* // 改变当前页,可以写到getPageList中省略一个函数
    handleCurrentChange(page) {
      this.page = page;
      this.getPageList();
    }, */

    // 分页器----改变页面展示数据条数
    handelSizeChange(size) {
      this.limit = size;
      this.getPageList();
    },

    // 添加品牌信息
    addTradeMark() {
      // 显示对话框
      this.dialogFormVisible = true;
      // 清空数据
      this.tmform = { tmName: "", logoUrl: "" };
    },

    // 修改某个品牌信息
    updataTradeMark(row) {
      this.dialogFormVisible = true;
      // console.log(row);
      // row里面有id，tmname和logoUrl
      // 将已有的信息赋值给tmform
      // this.tmform = row; //直接赋值会直接改变页面的数据
      this.tmform = { ...row }; //浅拷贝
    },

    // 删除某个品牌
    deleteTradeMark(row) {
      // 弹框
      this.$confirm(`你确定删除${row.tmName}, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          // 点击确认按钮触发
          // 向服务器发请求
          let result = await this.$API.trademark.reqDeleteTreadeMark(row.id);
          if (result.code == 200) {
            this.$message({
              type: "success",
              message: "删除成功!",
            });
            // 再次获取品牌列表数据
            // 当前页数据大于1停留在当前页，当前页数据小于1去上一页
            this.getPageList(this.list.length > 1 ? this.page : this.page - 1);
          }
        })
        .catch(() => {
          // 点击取消按钮触发
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    // 上传图片的相关回调
    // 上传图片成功
    handleAvatarSuccess(res, file) {
      // res：上传成功之后返回的新增数据
      // 将图片的本地数据替换为服务器返回的IP地址
      this.tmform.logoUrl = res.data;
    },
    // 上传之前
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    // 确定按钮，添加或修改品牌信息(这里有问题)
    addOrUpdate() {
      // 在表单验证字段都通过之后，在处理业务逻辑
      this.$refs.ruleForm.validate(async (success) => {
        // console.log(success); //返回布尔值
        if (success) {
          // 隐藏弹框
          this.dialogFormVisible = false;
          // 发请求，添加或修改品牌信息
          let result = await this.$API.trademark.reqAddOrUpdateTreadeMark(
            this.tmform
          );
          // 接口函数没有return，所以返回undefined
          // console.log("addOrUpdate", result); //不知道为什么这里返回undefined
          console.log(this.tmform);
          if (result.code == 200) {
            // 弹出提示信息
            this.$message({
              message: this.tmform.id ? "修改品牌成功" : "添加品牌成功",
              type: "success",
            });
            // 添加或修改成功之后需要再次获取品牌列表进行展示
            // 如果添加品牌需要在最后一页，如果修改品牌需要在当前页
            let lastPage = Math.ceil(this.total / this.limit);
            // 最后一页数据满了就加一页，没满就最后一页
            let finalPage =
              lastPage % this.total == 0 ? lastPage + 1 : lastPage;
            this.getPageList(this.tmform.id ? this.page : finalPage);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>