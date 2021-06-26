import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';
import pagination from './pagination.js';  // 載入分頁元件

import productModal from './productModal.js';

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const app = Vue.createApp({
  data() {
    return {
      // 讀取效果
      loadingStatus: {
        loadingItem: '',  // 放入讀取物件 id
      },
      // 產品列表
      products: [],
      // props 傳遞到內層的暫存資料
      product: {},
      // 表單結構(送出用戶資料，參照API文件)
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
      // 購物車列表
      cart: {},
      final_total: 0,
      // 分頁資訊
      pagination: {}
    };
  },
  components: {
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
    pagination
  },
  methods: {
    getProducts(page = 1) {
      const api = `${apiUrl}/api/${apiPath}/products?page=${page}`;
      axios.get(api)
        .then(res => {
          if(res.data.success){
            this.products = res.data.products;
            this.pagination = res.data.pagination;
          }else{
            toastr.error(res.data.messages);
          }
        }).catch((error)=>{
          toastr.error(error);
        })
    },
    openModal(item) {
      // 避免使用者不斷點選
      this.loadingStatus.loadingItem = item.id;

      const api = `${apiUrl}/api/${apiPath}/product/${item.id}`;
      axios.get(api)
        .then(res => {
          if(res.data.success){
            console.log(res);
            this.product = res.data.product;
            this.$refs.userProductModal.openModal();
          }else{
            toastr.error(res.data.message);
          }
        }).catch((error)=>{
          toastr.error(error);
        })

      // 清空
      this.loadingStatus.loadingItem = '';
    },

    // 主頁加入購物車
    addCart(id, qty = 1) {    // 給定數量預設值
      
      // 定義購物車結構
      const cart = {
        product_id: id,
        qty
      }
      
      const api = `${apiUrl}/api/${apiPath}/cart`;
      axios.post(api, { data: cart })
      .then(res => {
          this.loadingStatus.loadingItem = id;
          if(res.data.success){
            console.log(res.data);
            if (res.data.success === true) toastr.success('加入購物車成功');
            else toastr.error('加入購物車失敗');
  
            //  更新購物車列表
            this.getCart();
          }else{
            toastr.error(res.data.message);
          }
        }).catch((error)=>{
          toastr.error(error);
        })

      this.loadingStatus.loadingItem = '';


    },
    // 顯示購物車列表
    getCart() {
      const api = `${apiUrl}/api/${apiPath}/cart`;
      axios.get(api)
        .then(res => {
          if (res.data.success) {
            this.cart = res.data.data;
            this.final_total = res.data.data.final_total;
          } else {
            console.log(res.data.message);
          }
        }).catch((error)=>{
          toastr.error(error);
        })
    },
    // 更新購物車
    updateCart(item) {
      this.loadingStatus.loadingItem = item.id;

      const api = `${apiUrl}/api/${apiPath}/cart/${item.id}`;
      // 帶入API要求參數
      const cart = {
        product_id: item.product.id,  // 帶入產品id
        qty: item.qty
      }
      console.log(cart, api);

      axios.put(api, { data: cart })
        .then(res => {
          if(res.data.success){
            console.log(res);
            this.loadingStatus.loadingItem = '';
            this.getCart();
          }else{
            toastr.error(res.data.message);
          }
        }).catch((error)=>{
          toastr.error(error);
        })
    },
    // 商品+1
    addOneProduct(item) {
      // 避免被重複點選
      this.loadingStatus.loadingItem = item.id;
      let qty = item.qty + 1;

      if (qty >= 10) {
        toastr.info('商品最多購買數量為10樣');
      } else {
        // 重新寫入
        const api = `${apiUrl}/api/${apiPath}/cart/${item.id}`;
        const cart = {
          product_id: item.product.id,  // 帶入產品id
          qty: qty
        }
        axios.put(api, { data: cart })
          .then(res => {
            if(res.data.success){
              this.loadingStatus.loadingItem = '';
              this.getCart();
            }else{
              toastr.error(res.data.message);
            }
          }).catch((error)=>{
            toastr.error(error);
          })

      }

    },
    // 商品-1
    lessOneProduct(item) {
      // 避免被重複點選
      this.loadingStatus.loadingItem = item.id;
      let qty = item.qty - 1;

      if (qty <= 0) {
        toastr.error('商品至少須購買一樣');
      } else {
        // 重新寫入
        const api = `${apiUrl}/api/${apiPath}/cart/${item.id}`;
        const cart = {
          product_id: item.product.id,  // 帶入產品id
          qty: qty
        }
        axios.put(api, { data: cart })
          .then(res => {
            if(res.data.success){
              this.loadingStatus.loadingItem = '';
              this.getCart();
            }else{
              toastr.error(res.data.message);
            }
          }).catch((error)=>{
            toastr.error(error);
          })

      }

    },
    // 刪除單一商品
    delProduct(id) {
      // console.log(id);
      const api = `${apiUrl}/api/${apiPath}/cart/${id}`;

      axios.delete(api)
        .then((res) => {
          if (res.data.success) {
            toastr.success('商品刪除成功');
          } else {
            toastr.error('商品刪除失敗');
          }
          this.getCart();
        }).catch((error)=>{
          toastr.error(error);
        })

    },
    // 刪除全部購物車商品
    delProductAll() {
      const api = `${apiUrl}/api/${apiPath}/carts`;

      axios.delete(api)
        .then((res) => {
          if (res.data.success) {
            toastr.success('購物車刪除成功')
          } else {
            toastr.error('購物車刪除失敗');
          }
          this.getCart();
        }).catch((error)=>{
          toastr.error(error);
        })

    },
    // 送出表單
    onSubmit() {
      const api = `${apiUrl}/api/${apiPath}/order`;
      const order = this.form;
  
      axios.post(api, { data: order }).then((res) => {
        if (res.data.success) {
          toastr.success(res.data.message);

          this.$refs.form.resetForm();
          console.log(order);
          
          this.getCart();
        } else {
          toastr.error(res.data.message);

        }
      });


  },


  },
  mounted() {
    // 使用 userProductModal 方式開啟 Modal
    this.getProducts();

    //  更新購物車列表
    this.getCart();

  },
});

// 加入多國語系
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});

// 定義規則(全部加入)
Object.keys(VeeValidateRules).forEach(rule => {
  if (rule !== 'default') {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 註冊表單元件
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);


app.component('userProductModal', productModal)

app.mount('#app');