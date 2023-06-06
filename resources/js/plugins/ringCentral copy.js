import { SDK } from '@ringcentral/sdk'
import axios from 'axios'

const redirectUri = 'http://127.0.0.1:8000/rc-login'
export const rcsdk = new SDK({
  server: 'https://platform.ringcentral.com',
  clientId: 'g4_l57DRQ1CfeeZ09-eNIw',
  redirectUri: redirectUri,
})
// eslint-disable-next-line import/prefer-default-export
export const platform = rcsdk.platform()

platform.on('refreshSuccess', async function(res){
  const data = await res.json()

  localStorage.setItem('ringCentral', JSON.stringify(data))
})

async function authenticate(code) {
  try {
    var token = await platform.login({ code:code.code, redirect_uri: redirectUri, headers: 
      {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json',
      }
    })  

    // Store the tokens in the browser's local storage
    // localStorage.setItem('access_token', JSON.parse(token).access_token)
    // localStorage.setItem('refresh_token', JSON.parse(token).refresh_token)
  } catch (e) {
    console.log(window.Response())
    console.error('Authentication failed', e)   

    return false
  }
}

const implicit = false
const usePKCE = true
const loginUrl = platform.loginUrl({ implicit, usePKCE })

const showRingCentralLoginWindow = function(){
  platform.loginWindow({
    url: loginUrl,
  })
    .then(function(res){
      authenticate(res)
    })
}

// fetch call logs admin
export const fetchCallLogs = async function(phone){
  const url = `/restapi/v1.0/account/~/extension/~/call-log?phoneNumber=${phone}&dateFrom=2017-09-03T12:34:00.000Z`
  const r = await platform.get(url)

  return await r.json()
}

// get recording
export const fetchRecording = async function(recordingId){
  const r = await platform.get(`/restapi/v1.0/account/~/recording/${recordingId}`)
  const rData = await r.json()
  const recordingUri = rData.contentUri
  const token = store.getters.ringCentralToken.access_token

  const fileBlob = await axios.get(recordingUri, {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return new File([fileBlob.data], `${recordingId}.mp3`, { type: fileBlob.headers['content-type'] })
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

export function formatNumber(phoneNumber) {
  const firstChar = phoneNumber.charAt(0)
  if (firstChar === '+') return phoneNumber.substring(1)
  if (firstChar === '0') return `44${phoneNumber.substring(1)}`

  return phoneNumber
}
