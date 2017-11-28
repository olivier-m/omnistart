<template>
  <div id="app">
    <nav id="nav">
      <ul>
        <li><router-link :to="{name: 'settings'}" title="settings">
          <SettingsIcon fill="currentColor" />
        </router-link></li>
        <li><router-link :to="{name: 'main'}">
          <TopSitesIcon fill="currentColor" /><span>Top Sites</span>
        </router-link></li>
        <li><router-link :to="{name: 'bookmarks'}">
          <BookmarksIcon fill="currentColor" /><span>All bookmarks</span>
        </router-link></li>
      </ul>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
import BookmarksIcon from './assets/tags.svg';
import SettingsIcon from './assets/cog.svg';
import TopSitesIcon from './assets/star-full-outline.svg';


export default {
  name: 'App',
  components: {BookmarksIcon, SettingsIcon, TopSitesIcon}
};
</script>
