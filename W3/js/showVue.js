// 顯示提示訊息
toastr.success('登入成功')

// 載入 Vue
import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.js';

let productModal = {}; // 定義接近全域變數

const app = createApp({
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io/api',
      apiPath: 'casper-hexschool',
      products: [],
      isNew: false,
      tempProduct: { // 稍後調整資料使用的結構
        // imagesUrl: [],
      },
    }
  },
  mounted() {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common['Authorization'] = token;

    // Bootstrap 實體
    productModal = new bootstrap.Modal(document.getElementById('productModal'));

    this.getProducts();
  },
  methods: {
    getProducts() {
      const url = `${this.apiUrl}/${this.apiPath}/admin/products`;
      axios.get(url) // 請求
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            this.products = res.data.products
          } else {
            alert('....'); // 帶入錯誤
          }
        })
    },
    openModal(isNew, item) {
      this.isNew = isNew;
      if (this.isNew) {
        this.tempProduct = {
          // imagesUrl: [],
        };
      } else {
        this.tempProduct = {...item};
      }
      productModal.show();
    },
    createImages() {
      this.tempProduct.imagesUrl = [
        ''
      ]
    },
    updateProduct() {
      let url = `${this.apiUrl}/${this.apiPath}/admin/product`;
      let method = 'post';
      if (!this.isNew) {
        url = `${this.apiUrl}/${this.apiPath}/admin/product/${this.tempProduct.id}`
        method = 'put';
      }

      axios[method](url, {data: this.tempProduct})
        .then(res=> {
          if (res.data.success) {
            this.getProducts();
            productModal.hide();
          }
        })
    }
  }
});


app.mount('#app');




