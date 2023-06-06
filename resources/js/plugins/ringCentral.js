import { SDK } from '@ringcentral/sdk'
import axios from 'axios'

const RC_SERVER_URL = 'https://platform.ringcentral.com'
const RC_CLIENT_ID = 'g4_l57DRQ1CfeeZ09-eNIw'
const RC_REDIRECT_URI = 'http://127.0.0.1:8000/rc-login'
const RC_CLIENT_SECRET = ''

const rcsdk = new SDK({
  server:       RC_SERVER_URL,
  clientId:     RC_CLIENT_ID,
  clientSecret: RC_CLIENT_SECRET,
  redirectUri:  RC_REDIRECT_URI,
})

const platform = rcsdk.platform()

var loginUrl = platform.loginUrl({
  "state": "1234567890",
  "usePKCE": true,
})

platform.on('refreshSuccess', async function(res){
  const data = await res.json()

  localStorage.setItem('ringCentral', JSON.stringify(data))
})

const showRingCentralLoginWindow = function(){
  platform.loginWindow({ url:loginUrl })
    .then(function (res) {
      platform.login({
        code: res.code,
        redirectUri: RC_REDIRECT_URI,
      })
        .then(function (token) {
          req.session.tokens = token.json()
          console.log('login success')
        })
        .catch(function (e) {
          console.log('Login error ' + e)
        })
    })
}

// fetch call logs admin
export const fetchCallLogs = async function(phone){
  const url = `/restapi/v1.0/account/~/extension/~/call-log?phoneNumber=${phone}&dateFrom=2017-09-03T12:34:00.000Z`
  const r = await platform.get(url)

  return await r.json()
}

export function checkRingCentralToken() {
  if(window.location.pathname !== '/rc-login') {
    const token = JSON.parse(localStorage.getItem('ringCentral')) ? JSON.parse(localStorage.getItem('ringCentral')) : null
    if (token === null) {
      showRingCentralLoginWindow()
    } else {
      platform.auth().setData(token)
      platform.refresh()
        .catch(e => {
          showRingCentralLoginWindow()
          console.log(e)
        })
    }
  }
}
