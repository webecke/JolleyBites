<script setup lang="ts">

</script>

<template>
  <div>
    <h1>Privacy Notice</h1>
    <p>I'm not a lawyer, nor am I a big software company, so lets not make this too complicated.</p>
    <hr/>
    <p>Last updated: <em>October 1, 2024</em></p>

    <h2>Introduction</h2>
    <p>ForestBlue Development ("we", "our", or "us") is committed to protecting your privacy.
      This Privacy Notice explains how we collect, use,
      and protect your data when you use JolleyBites' website and services.</p>

    <h2>Data Collection and Use</h2>
    <p>We collect only the data you, the user, provide to us directly. This includes:</p>
    <ul>
      <li>Your username</li>
      <li>Your first name</li>
      <li>Your email</li>
      <li>Your recipes and ingredients</li>
      <li>Any other data you enter into the site</li>
    </ul>
    <p>This data is used to make the app work.</p>

    <h2>Data Storage</h2>
    <p>All data collected and stored is stored unencrypted on a database maintained by
      <a href="https://cloudflare.com" target="_blank">Cloudflare</a>
    The only exception is your password, which is encrypted before storage,
      and is encrypted via the HTTPS protocol during transit to our data storage.</p>

    <h2>Cookies and Tracking</h2>
    <p>We use one and only one cookie. Its called "jolleybites_auth_token" and its a
      string of random characters, unique to you that allows you to stay logged in
      between page reloads. It just lets us know you are you.
    </p>

    <h2>Data Sharing</h2>
    <p>We do not purposefully share your data with anyone outside of our team.
      However, please note that we are a small development team, and our code may not be perfect.
      As such, we cannot guarantee absolute security of your data.
      Given our limitations, <b>we strongly advise against entering any sensitive information into our site.</b></p>

    <h2>Changes to This Notice</h2>
    <p>We don't anticipate changing anything on this Privacy Notice, but we reserve the right to.
      This page will always have the most up-to-date version of the Privacy Notice.</p>
  </div>
</template>

<style scoped>
p, ul{
  margin: 15px 0;
}
div {
  min-height: 70vh;
  width: 50vw;
  min-width: min(600px, 90vw);
  margin: 0 15px;
}
</style>