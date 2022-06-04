<script lang="ts">
  import { afterUpdate } from "svelte";
  import type { TezosToolkit } from "@taquito/taquito";
  import { bytes2Char } from "@taquito/utils";
  import config from "../config";

  export let Tezos: TezosToolkit,
    mvpAddress: string,
    userAddress: string,
    network: any;

  let mvp: string;

  afterUpdate(async () => {
    if (mvpAddress && mvpAddress !== userAddress) {
      console.log("MVP update");
      const domainContractAddress = config.tezosDomains[network];
      const contract = await Tezos.wallet.at(domainContractAddress);
      const storage: any = await contract.storage();
      const domain = await storage.store.reverse_records.get(mvpAddress);
      if (domain) {
        mvp = bytes2Char(domain.name);
      } else {
        mvp = `${mvpAddress.slice(0, 5)}...${mvpAddress.slice(-5)}`;
      }
    }
  });
</script>

<style lang="scss">
  .mvp {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @media only screen and (max-width: 600px) {
    .mvp {
      top: auto;
      bottom: 20px;
      right: 20px;
    }
  }
</style>

<div class="mvp">
  {#if mvpAddress === userAddress}
    Current MVP: it's you!
  {:else if !mvpAddress}
    No MVP yet
  {:else if mvp}
    Current MVP: {mvp}
  {/if}
</div>
