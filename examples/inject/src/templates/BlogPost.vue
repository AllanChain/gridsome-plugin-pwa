<template>
  <Layout>
    <h1>{{$page.blogPost.title}}</h1>
    <p id="description" v-html="$page.blogPost.description" />
    <div id="content" v-html="$page.blogPost.content" />
  </Layout>
</template>

<page-query>
query BlogPost ($id: ID!) {
  blogPost (id: $id) {
    title
    path
    description
    content
  }
}
</page-query>

<script>
export default {

}
</script>

<style>

</style>
