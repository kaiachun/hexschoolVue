const usernameInput = document.querySelector('#username');
const pwInput = document.querySelector('#password');
const loginBtn = document.querySelector('#login');
// 按鈕事件監聽
loginBtn.addEventListener('click', login);

// 若再 login function 外先取得值，會取到空值
// 取得 Token ，將 Token 存到 Cookie
function login(event) {  // 要使用 event.perventDefault，function 須加上相同參數 event
  event.preventDefault();
  const username = usernameInput.value;
  const password = pwInput.value;
  // 帶入api需求欄位
  const data = {
    username,
    password,
  }

  axios.post(`${apiUrl}/admin/signin`, data)  // 發出請求
    .then((res) => {
      // 儲存 expired、token (token每次都要打，但cookie不用一直存)
      if (res.data.success) {
        // 解構 縮寫寫法，取得res.data中的 token、expired
        const { token, expired } = res.data;
        console.log(token, expired);
        // 存入 cookie (new Date 轉換 unix timestamp)
        document.cookie = `hexToken=${token};expires=${new Date(expired)}; path=/`

        //換頁
        window.location = 'showProduct.html';
      } else {
        toastr.error(res.data.message);
      }
    }).catch((error)=>{
      console.log(error);
    });

}


