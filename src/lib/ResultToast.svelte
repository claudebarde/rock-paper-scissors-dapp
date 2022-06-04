<script lang="ts">
  import { fly } from "svelte/transition";
  import { quintInOut } from "svelte/easing";
  import SmileImg from "../assets/smile.svg";
  import FrownImg from "../assets/frown.svg";

  export let result: boolean, text: string;
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .toast {
    position: absolute;
    bottom: 70px;
    margin: 0 auto;
    background-color: $tangerine;
    padding: 10px 20px;
    border-radius: 0.5rem;
    font-size: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }
</style>

<div
  class="toast"
  transition:fly={{ duration: 400, y: 200, easing: quintInOut }}
>
  {#if result === true}
    <img src={SmileImg} alt="smile" />
  {:else}
    <img src={FrownImg} alt="frown" />
  {/if}
  <span>{text}</span>
</div>
