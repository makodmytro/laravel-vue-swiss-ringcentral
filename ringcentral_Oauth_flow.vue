// Create a new component that will handle the OAuth flow:
<template>
  <div>
    <button @click="authorize()">Authorize</button>
  </div>
</template>

<script>
import { SDK } from 'ringcentral-client';
import axios from 'axios';
import VueAxios from 'vue-axios';

export default {
  name: 'RingCentralAuth',
  methods: {
    authorize() {
      // Set up the RingCentral JS SDK
      const rc = new SDK({
        clientId: process.env.VUE_APP_RINGCENTRAL_CLIENT_ID,
        clientSecret: process.env.VUE_APP_RINGCENTRAL_CLIENT_SECRET,
        server: process.env.VUE_APP_RINGCENTRAL_SERVER_URL,
      });

      // Generate a PKCE code verifier and challenge
      const codeVerifier = this.base64URLEncode(this.generateRandomString(32));
      const codeChallenge = this.base64URLEncode(this.sha256(codeVerifier));

      // Save the code verifier to local storage
      localStorage.setItem('rc_code_verifier', codeVerifier);

      // Open the RingCentral authorization page in a popup window
      const authUrl = rc.platform().authUrl({
        redirectUri: process.env.VUE_APP_RINGCENTRAL_REDIRECT_URI,
        responseType: 'code',
        state: 'state',
        codeChallenge,
        codeChallengeMethod: 'S256',
      });

      const popup = window.open(authUrl, '_blank', 'width=400,height=600');

      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          this.callback();
        }
      }, 500);
    },
    async callback() {
      // Retrieve the authorization code from the query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      // Retrieve the code verifier from local storage
      const codeVerifier = localStorage.getItem('rc_code_verifier');

      // Exchange the authorization code for an access token
      const rc = new SDK({
        clientId: process.env.VUE_APP_RINGCENTRAL_CLIENT_ID,
        clientSecret: process.env.VUE_APP_RINGCENTRAL_CLIENT_SECRET,
        server: process.env.VUE_APP_RINGCENTRAL_SERVER_URL,
      });

      await rc.platform().login({
        code,
        redirectUri: process.env.VUE_APP_RINGCENTRAL_REDIRECT_URI,
        codeVerifier,
      });

      // Save the access token to Vuex store
      this.$store.commit('setRingCentralAccessToken', rc.token().access_token);

      // Redirect the user back to the home page
      this.$router.push('/');
    },
    generateRandomString(length) {
      const charset ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const values = window.crypto.getRandomValues(new Uint32Array(length));
      for (let i = 0; i < length; i++) {
        result += charset[values[i] % charset.length];
      }

      return result;
    },
    sha256(plain) {
      const encoder = new TextEncoder();
      const data = encoder.encode(plain);
      return window.crypto.subtle.digest('SHA-256', data);
    },
    base64URLEncode(str) {
      let base64 = btoa(str);
      base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return base64;
    },
  },
  created() {
    // Set up the axios instance with VueAxios
    Vue.use(VueAxios, axios);

    // Check if the current URL has an authorization code
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code')) {
      this.callback();
    }
  },
};
</script>
<!-- In your Vue component, import the RingCentralAuth component and use it:
<template>
  <div>
    <ring-central-auth />
  </div>
</template>

<script>
import RingCentralAuth from './RingCentralAuth.vue';

export default {
  name: 'MyComponent',
  components: {
    RingCentralAuth,
  },
  data() {
    return {
      data: [],
    };
  },
  created() {
    // Make a request to the Laravel API endpoint
    this.axios
      .get('/api/resource', {
        headers: {
          Authorization: 'Bearer ' + this.$store.state.ringcentralAccessToken,
        },
      })
      .then((response) => {
        this.data = response.data;
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
</script>
In this example, the RingCentralAuth component will handle the OAuth flow using popup method. Once the user has authorized the app and an access token has been obtained, the component will save the access token to the Vuex store. The MyComponent then makes a request to the Laravel API endpoint with the access token in the authorization header. -->
