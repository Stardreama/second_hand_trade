import { createApp } from 'vue'
import App from './App'

// 引入Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTags, faShoppingCart, faUpload, faMapMarkerAlt, faDollarSign, faSortAmountUp, faList, faHandshake, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

// 添加图标到库中
library.add(faTags, faShoppingCart, faUpload, faMapMarkerAlt, faDollarSign, faSortAmountUp, faList, faHandshake, faPaperPlane)

// 创建Vue应用实例
const app = createApp(App)

// 使用Vue 3的方法注册插件和组件
app.component('font-awesome-icon', FontAwesomeIcon)

// 挂载应用
app.mount('#app')