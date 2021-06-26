// 載入 Vue
import {createApp} from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';

let productModal = null;
let delProductModal = null;

createApp({
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io',
      user: {
        username: '',
        password: '',
      },
      page: 'showProduct',  // 跳轉頁面名稱
    };
  },
  methods: {
    login() {
      const api = `${this.apiUrl}/admin/signin`;

      axios.post(api, this.user).then((response) => {
        if(response.data.success) {
          const { token, expired } = response.data;
          // 取得 Token ，將 Token 存到 Cookie
          // expires 設置有效時間
          document.cookie = `hexToken=${token};expires=${new Date(expired)}; path=/`;

          window.location = `${this.page}.html`;
          // window.location = 'showProduct.html';
        } else {
          toastr.error(res.data.message);
        }
      }).catch((error) => {
        toastr.error('登入失敗');
        console.log(error);
      });
    },
  },
}).mount('#app');




