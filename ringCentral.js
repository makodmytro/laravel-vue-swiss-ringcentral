import { SDK } from '@ringcentral/sdk'
import axios from 'axios'
import localforage from 'localforage'

export const rcsdk = new SDK({
  server: 'https://platform.ringcentral.com',
  clientId: 'g4_l57DRQ1CfeeZ09-eNIw',
  redirectUri: 'http://127.0.0.1:8000/rc-login',
})
// eslint-disable-next-line import/prefer-default-export
export const platform = rcsdk.platform()

platform.on('refreshSuccess', async res => {
  const data = await res.json()

  localforage.setItem('ringCentral', JSON.stringify(data))
})

const implicit = false
const usePKCE = true

const showRingCentralLoginWindow = () => {
  platform
    .loginWindow({
      url: platform.loginUrl({ implicit, usePKCE, redirectUri: 'http://127.0.0.1:8000/rc-login' }),
    })
    .then(rcsdk.login.bind(platform))
    .then(res => {
      const data = res.json()

      localforage.setItem('ringCentral', JSON.stringify(data))
    })
}

// fetch call logs admin
export const fetchCallLogs = async phone => {
  const url = `/restapi/v1.0/account/~/extension/~/call-log?phoneNumber=${phone}&dateFrom=2017-09-03T12:34:00.000Z`
  const r = await platform.get(url)

  return await r.json()
}

// get recording
export const fetchRecording = async recordingId => {
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
    const token = JSON.parse(localforage.getItem('ringCentral')) ? JSON.parse(localforage.getItem('ringCentral')) : null
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
