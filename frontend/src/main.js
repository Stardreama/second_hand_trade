import { createApp } from 'vue'
import App from './App'

// 引入Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTags, faShoppingCart, faUpload, faMapMarkerAlt, faDollarSign, faSortAmountUp, faList, faHandshake, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

// 添加图标到库中
library.add(faTags, faShoppingCart, faUpload, faMapMarkerAlt, faDollarSign, faSortAmountUp, faList, faHandshake, faPaperPlane)

const app = createApp(App)

// 注册全局组件
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')