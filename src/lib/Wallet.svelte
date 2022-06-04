<script lang="ts">
  import type BigNumber from "bignumber.js";
  import UserIcon from "../assets/user-x.svg";
  import type { UserResults } from "../types";

  export let disconnect, userResults: UserResults;
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .wallet {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;

    button {
      border: solid 2px $blue-green;
      border-radius: 50%;
      background-color: $light-cornflower-blue;
      padding: 10px 12px;
      transition: 0.3s;

      &:hover {
        border-width: 4px;
        margin-right: -4px;
        margin-top: -4px;
      }
    }

    .user-results {
      text-align: center;
    }
  }
</style>

<div class="wallet">
  {#if userResults}
    <div class="user-results">
      <div>Won</div>
      <div>{userResults.won.amount.toNumber()}</div>
    </div>
    <div class="user-results">
      <div>Lost</div>
      <div>{userResults.lost.toNumber()}</div>
    </div>
  {/if}
  <button on:click={disconnect}>
    <img src={UserIcon} alt="user" />
  </button>
</div>
